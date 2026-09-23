import { useState, useMemo, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import DefaultSelect from "../components/Forms/DefaultSelect";
import SvgIcon from "../components/icons/SvgIcon";
import {
  useGetStudentGroupFiltersQuery,
  useGetStudentGroupListQuery,
  useAddStudentGroupMutation,
  useRemoveStudentGroupMutation,
} from "../features/exam/examQuerySlice";

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */

const bn = (num) => {
  if (num === "" || num === null || num === undefined) return "";
  const d = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (x) => d[x]);
};

// API রেসপন্স → প্যানেলের রো।
// বাম পাশে id = Student_Admission.AdmissionID, ডান পাশে id = Student_Result.ID
const toRow = (id, user, subClass = "") => ({
  id,
  code: user?.UserCode ?? "",
  name: user?.UserName ? (user.UserName) : "",
  subClass: subClass ? (subClass) : "",
});

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
    <label
      className={`inline-flex items-center gap-2 select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
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

/* ---------------------------------------------------------
   List panel — বামে "সাব ক্লাস হতে", ডানে "সাব ক্লাশ পর্যন্ত" (গ্রুপ)
   drag & drop টার্গেট + সোর্স — সিলেক্টেড রো টেনে অন্য পাশে ছাড়লেই মুভ হয়
--------------------------------------------------------- */

function ListPanel({
  title, subTitle, titleColor, rows, totalCount, checkedSet, onToggleAll, onToggleOne,
  filter, onFilterChange, filterLabel, filterLabelColor,
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
          <div>
            <h1 className={`text-[16px] font-bold leading-snug ${titleColor}`}>{title}</h1>
            {subTitle && <p className="text-sm text-slate-500 mt-0.5">{subTitle}</p>}
          </div>
          <span className="h-[38px] flex items-center border border-stroke rounded bg-white px-4 whitespace-nowrap shrink-0 text-sm font-semibold text-slate-800">
            {bn(totalCount)} জন
          </span>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-1.5 ml-auto">
            {filterLabel && (
              <span className={`text-sm font-semibold ${filterLabelColor}`}>{filterLabel}</span>
            )}
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
        <table className="w-full min-w-[460px] text-sm">
          <thead className="sticky top-0 bg-slate-50 text-xs tracking-wide z-10">
            <tr>
              <th className="px-3 py-2.5 text-left w-8">
                <Checkbox checked={allChecked} onChange={onToggleAll} />
              </th>
              <th className="px-3 py-2.5 text-left">আইডি</th>
              <th className="px-3 py-2.5 text-left">শিক্ষার্থীর নাম</th>
              <th className="px-3 py-2.5 text-left">সাব ক্লাস</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-slate-400 italic py-8 text-sm">
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
                    <td className="px-3 py-3 font-mono">{bn(s.code || s.id)}</td>
                    <td className="px-3 py-3 font-medium text-slate-800 whitespace-nowrap">{s.name}</td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{s.subClass || "—"}</td>
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

export default function StudentGroupCreate() {
  // ফিল্টার ID রাখে
  const [session, setSession] = useState(null);
  const [examId, setExamId] = useState(null);
  const [fromSubClass, setFromSubClass] = useState(null); // সাব ক্লাস হতে — সব সাব ক্লাস
  const [toSubClass, setToSubClass] = useState(null); // সাব ক্লাশ পর্যন্ত — cascading

  /* ---------------- ফিল্টার ডাটা ---------------- */
  const { data: filterData } = useGetStudentGroupFiltersQuery();
  const sessionTree = useMemo(() => filterData?.sessions || [], [filterData]);
  const allSubClasses = useMemo(() => filterData?.subClasses || [], [filterData]);

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
        name: e.ExamName ? (e.ExamName) : "",
      })),
    [selectedSession]
  );

  // ৩) বাম পাশের "সাব ক্লাস হতে" — cascading না, সব সাব ক্লাস
  const fromSubClassOptions = useMemo(
    () =>
      allSubClasses.map((c) => ({
        value: c.SubClassID,
        name: c.SubClass ? (c.SubClass) : "",
      })),
    [allSubClasses]
  );

  // ৪) ডান পাশের "সাব ক্লাশ পর্যন্ত" — নির্বাচিত পরীক্ষার নিচের সাব ক্লাস
  const selectedExam = useMemo(
    () => (selectedSession?.exams || []).find((e) => String(e.ExamID) === String(examId)),
    [selectedSession, examId]
  );
  const toSubClassOptions = useMemo(
    () =>
      (selectedExam?.subClasses || []).map((c) => ({
        value: c.SubClassID,
        name: c.SubClass ? (c.SubClass) : "",
      })),
    [selectedExam]
  );

  // নির্বাচিত সাব ক্লাসের নাম — প্যানেলের সাবটাইটেলে দেখানোর জন্য
  const fromSubClassName = fromSubClassOptions.find((o) => String(o.value) === String(fromSubClass))?.name || "";
  const toSubClassName = toSubClassOptions.find((o) => String(o.value) === String(toSubClass))?.name || "";

  // উপরের লেভেল বদলালে নিচের লেভেলগুলো রিসেট
  const handleSessionChange = (opt) => {
    if (!opt) return;
    setSession(opt.value);
    setExamId(null);
    setToSubClass(null);
  };
  const handleExamChange = (opt) => {
    if (!opt) return;
    setExamId(opt.value);
    setToSubClass(null);
  };
  const handleFromSubClassChange = (opt) => {
    if (!opt) return;
    setFromSubClass(opt.value);
  };
  const handleToSubClassChange = (opt) => {
    if (!opt) return;
    setToSubClass(opt.value);
  };

  const filterMethods = useForm({
    defaultValues: { Session: "", Exam: "", FromSubClass: "", ToSubClass: "" },
  });

  useEffect(() => {
    filterMethods.setValue("Session", session ?? "");
  }, [session, filterMethods]);

  useEffect(() => {
    filterMethods.setValue("Exam", examId ?? "");
  }, [examId, filterMethods]);

  useEffect(() => {
    filterMethods.setValue("FromSubClass", fromSubClass ?? "");
  }, [fromSubClass, filterMethods]);

  useEffect(() => {
    filterMethods.setValue("ToSubClass", toSubClass ?? "");
  }, [toSubClass, filterMethods]);

  /* ---------------- তালিকা API ---------------- */
  // বাম = Student_Admission (উৎস সাব ক্লাস), ডান = Student_Result (গ্রুপ)
  const filtersReady = Boolean(session && examId && fromSubClass);
  const {
    currentData: listData,
    isFetching: isListFetching,
    isError: isListError,
  } = useGetStudentGroupListQuery(
    {
      SessionID: session,
      ExamID: examId,
      FromSubClassID: fromSubClass,
      ToSubClassID: toSubClass,
    },
    { skip: !filtersReady }
  );

  const [addStudentGroup, { isLoading: isAdding }] = useAddStudentGroupMutation();
  const [removeStudentGroup, { isLoading: isRemoving }] = useRemoveStudentGroupMutation();

  // API কল চলাকালীন ড্র্যাগ বন্ধ — যাতে রিফ্রেশের আগে ভুল ID নিয়ে আবার মুভ না হয়
  const busy = isAdding || isRemoving || isListFetching;

  const [available, setAvailable] = useState([]);
  const [group, setGroup] = useState([]);

  const [availableChecked, setAvailableChecked] = useState(new Set());
  const [groupChecked, setGroupChecked] = useState(new Set());
  const [availableFilter, setAvailableFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");

  const [toast, setToast] = useState(null);
  const [apiError, setApiError] = useState(null);

  // API ডাটা → লোকাল state (প্রতিবার রিফেচের পর আসল ID দিয়ে রিসেট)
  useEffect(() => {
    setAvailable((listData?.available || []).map((a) => toRow(a.AdmissionID, a.User, fromSubClassName)));
    setGroup((listData?.added || []).map((r) => toRow(r.ID, r.User, r.SourceSubClass)));
    setAvailableChecked(new Set());
    setGroupChecked(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listData]);

  // ফিল্টার বদলালে পুরনো এরর মুছে যাবে
  useEffect(() => {
    setApiError(null);
  }, [session, examId, fromSubClass, toSubClass]);

  /* ---------------- ফিল্টার ---------------- */
  const availableRows = useMemo(
    () => available.filter((s) => matchesFilter(s, availableFilter)),
    [available, availableFilter]
  );
  const groupRows = useMemo(
    () => group.filter((s) => matchesFilter(s, groupFilter)),
    [group, groupFilter]
  );

  /* ---------------- সিলেকশন ---------------- */
  const toggleAvailableAll = (checked) => {
    setAvailableChecked((prev) => {
      const next = new Set(prev);
      availableRows.forEach((r) => (checked ? next.add(r.id) : next.delete(r.id)));
      return next;
    });
  };
  const toggleGroupAll = (checked) => {
    setGroupChecked((prev) => {
      const next = new Set(prev);
      groupRows.forEach((r) => (checked ? next.add(r.id) : next.delete(r.id)));
      return next;
    });
  };
  const toggleAvailableOne = (id, checked) => {
    setAvailableChecked((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  };
  const toggleGroupOne = (id, checked) => {
    setGroupChecked((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  };

  /* ---------------- এক পাশ থেকে অন্য পাশে move ---------------- */

  // বাম → ডান: গ্রুপে INSERT (ids = AdmissionID)
  const moveIdsToGroup = async (ids) => {
    if (!toSubClass) {
      setApiError("আগে 'সাব ক্লাশ পর্যন্ত' নির্বাচন করুন");
      return;
    }
    const idSet = new Set(ids);
    const moving = available.filter((s) => idSet.has(s.id));
    if (moving.length === 0 || !filtersReady) return;

    setApiError(null);
    try {
      await addStudentGroup({
        SessionID: session,
        ExamID: examId,
        FromSubClassID: fromSubClass,
        ToSubClassID: toSubClass,
        AdmissionIDs: moving.map((s) => s.id),
      }).unwrap();
    } catch (err) {
      setApiError(err?.data?.detail || err?.data?.error || "শিক্ষার্থী যোগ করা যায়নি");
      return;
    }

    // সফল হলে সাথে সাথে UI-তে দেখাও — রিফেচ এলে আসল Student_Result ID দিয়ে রিসেট হবে
    setAvailable((prev) => prev.filter((s) => !idSet.has(s.id)));
    setGroup((prev) => [...prev, ...moving]);
    setAvailableChecked((prev) => {
      const next = new Set(prev);
      idSet.forEach((id) => next.delete(id));
      return next;
    });
    setToast(`${bn(moving.length)} জন শিক্ষার্থী গ্রুপে যোগ হয়েছে`);
    setTimeout(() => setToast(null), 2600);
  };

  // ডান → বাম: গ্রুপ থেকে DELETE (ids = Student_Result.ID) — Student_Admission অপরিবর্তিত
  const moveIdsToAvailable = async (ids) => {
    const idSet = new Set(ids);
    const moving = group.filter((s) => idSet.has(s.id));
    if (moving.length === 0 || !filtersReady || !toSubClass) return;

    setApiError(null);
    try {
      await removeStudentGroup({
        SessionID: session,
        ExamID: examId,
        ToSubClassID: toSubClass,
        ResultIDs: moving.map((s) => s.id),
      }).unwrap();
    } catch (err) {
      setApiError(err?.data?.detail || err?.data?.error || "শিক্ষার্থী সরানো যায়নি");
      return;
    }

    setGroup((prev) => prev.filter((s) => !idSet.has(s.id)));
    setAvailableChecked((prev) => prev);
    setToast(`${bn(moving.length)} জন শিক্ষার্থীকে গ্রুপ থেকে সরানো হয়েছে`);
    setTimeout(() => setToast(null), 2600);
  };

  /* ---------------- Drag & Drop ---------------- */
  const [dragInfo, setDragInfo] = useState(null); // { side: "available" | "group", ids: number[] } | null
  const [dragOverSide, setDragOverSide] = useState(null);

  const handleRowDragStart = (side, id) => (e) => {
    if (busy) {
      e.preventDefault();
      return;
    }
    // রো-টা আগে থেকে সিলেক্ট করা থাকলে পুরো সিলেকশনটাই টানা হবে, নাহলে শুধু ওই একজন
    const checkedSet = side === "available" ? availableChecked : groupChecked;
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
      if (side === "group") moveIdsToGroup(dragInfo.ids);
      else moveIdsToAvailable(dragInfo.ids);
    }
    setDragInfo(null);
    setDragOverSide(null);
  };

  // legacy স্ক্রিনের "+" বাটন — সিলেক্ট করা শিক্ষার্থীদের একসাথে গ্রুপে পাঠায়
  const handleAddSelected = () => {
    if (availableChecked.size === 0) {
      setApiError("আগে বাম পাশ থেকে শিক্ষার্থী নির্বাচন করুন");
      return;
    }
    moveIdsToGroup(Array.from(availableChecked));
  };

  // খালি টেবিলে কী লেখা দেখাবে — ধাপে ধাপে গাইড
  const availableEmptyText = !session
    ? "প্রথমে শিক্ষাবর্ষ নির্বাচন করুন"
    : !examId
    ? "এবার পরীক্ষা নির্বাচন করুন"
    : !fromSubClass
    ? "এবার 'সাব ক্লাস হতে' নির্বাচন করুন"
    : isListError
    ? "ডাটা লোড করা যায়নি"
    : isListFetching && !listData
    ? "লোড হচ্ছে..."
    : "কোনো শিক্ষার্থী পাওয়া যায়নি";

  const groupEmptyText = !toSubClass
    ? "'সাব ক্লাশ পর্যন্ত' নির্বাচন করুন"
    : isListError
    ? "ডাটা লোড করা যায়নি"
    : isListFetching && !listData
    ? "লোড হচ্ছে..."
    : "এখনো কেউ গ্রুপে যোগ হয়নি";

  return (
    <div
      className="w-full min-h-screen overflow-x-hidden bg-slate-50 p-4 sm:p-6"
      style={{ fontFamily: "'Noto Sans Bengali','Kalpurush','SolaimanLipi',sans-serif" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-5 flex items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">শিক্ষার্থী গ্রুপ তৈরি</h1>
            <p className="text-sm sm:text-base">
              শিক্ষাবর্ষ → পরীক্ষা → সাব ক্লাস হতে নির্বাচন করুন, এরপর সাব ক্লাশ পর্যন্ত বেছে নিয়ে
              শিক্ষার্থী ড্র্যাগ করে গ্রুপে নিন
            </p>
          </div>
        </header>

        {/* Filters — বাম: শিক্ষাবর্ষ, পরীক্ষা, সাব ক্লাস হতে | ডান: সাব ক্লাশ পর্যন্ত */}
        <FormProvider {...filterMethods}>
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 mb-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* বাম ব্লক */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <DefaultSelect
                  label="শিক্ষাবর্ষ"
                  options={sessionOptions}
                  valueField="value"
                  nameField="name"
                  registerKey="Session"
                  onChange={handleSessionChange}
                />
                <DefaultSelect
                  label="পরীক্ষা"
                  options={examOptions}
                  valueField="value"
                  nameField="name"
                  registerKey="Exam"
                  disabled={!session}
                  onChange={handleExamChange}
                />
                <DefaultSelect
                  label="সাব ক্লাস হতে"
                  options={fromSubClassOptions}
                  valueField="value"
                  nameField="name"
                  registerKey="FromSubClass"
                  onChange={handleFromSubClassChange}
                />
              </div>

              {/* ডান ব্লক — সাব ক্লাশ পর্যন্ত + যোগ করার বাটন */}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <DefaultSelect
                    label="সাব ক্লাশ পর্যন্ত"
                    options={toSubClassOptions}
                    valueField="value"
                    nameField="name"
                    registerKey="ToSubClass"
                    disabled={!examId}
                    onChange={handleToSubClassChange}
                  />
                </div>
              </div>
            </div>
          </section>
        </FormProvider>

        {/* API এরর */}
        {apiError && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
            {apiError}
          </div>
        )}

        {/* Dual panel — ড্র্যাগ করে এক পাশ থেকে অন্য পাশে নেওয়া যায় */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <ListPanel
            title="যাদের গ্রুপে নিবেন তাদের নির্বাচন করুন"
            subTitle={fromSubClassName ? `সাব ক্লাস: ${fromSubClassName}` : ""}
            titleColor="text-slate-800"
            rows={availableRows}
            totalCount={available.length}
            checkedSet={availableChecked}
            onToggleAll={toggleAvailableAll}
            onToggleOne={toggleAvailableOne}
            filter={availableFilter}
            onFilterChange={setAvailableFilter}
            filterLabel="Filter"
            filterLabelColor="text-slate-800"
            side="available"
            onRowDragStart={handleRowDragStart}
            onRowDragEnd={handleRowDragEnd}
            onPanelDragOver={handlePanelDragOver("available")}
            onPanelDragLeave={handlePanelDragLeave("available")}
            onPanelDrop={handlePanelDrop("available")}
            isDragTarget={dragOverSide === "available"}
            draggingIds={dragInfo?.side === "available" ? dragInfo.ids : []}
            emptyText={availableEmptyText}
            busy={busy}
          />

          <ListPanel
            title="নিম্নোক্ত শিক্ষার্থীরা গ্রুপে যোগ হয়েছে"
            subTitle={toSubClassName ? `সাব ক্লাস: ${toSubClassName}` : ""}
            titleColor="text-slate-800"
            rows={groupRows}
            totalCount={group.length}
            checkedSet={groupChecked}
            onToggleAll={toggleGroupAll}
            onToggleOne={toggleGroupOne}
            filter={groupFilter}
            onFilterChange={setGroupFilter}
            filterLabel="Filter"
            filterLabelColor="text-slate-800"
            side="group"
            onRowDragStart={handleRowDragStart}
            onRowDragEnd={handleRowDragEnd}
            onPanelDragOver={handlePanelDragOver("group")}
            onPanelDragLeave={handlePanelDragLeave("group")}
            onPanelDrop={handlePanelDrop("group")}
            isDragTarget={dragOverSide === "group"}
            draggingIds={dragInfo?.side === "group" ? dragInfo.ids : []}
            emptyText={groupEmptyText}
            busy={busy}
          />
        </section>
      </div>
    </div>
  );
}
