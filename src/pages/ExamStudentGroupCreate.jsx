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

// permission না থাকলে যে মেসেজ backend থেকে আসে — fallback হিসাবে ব্যবহৃত
const INSERT_DENIED_MSG = "সেইভ করতে এডমিনের সাথে যোগাযোগ করুন";
const DELETE_DENIED_MSG = "ফলাফলের-তালিকা হতে বাতিল/ডিলিট করতে এডমিনের সাথে যোগাযোগ করুন";

// API রেসপন্স → প্যানেলের রো।
// বাম পাশে id = Student_Admission.AdmissionID, ডান পাশে id = Student_Result.ID
// ⭐ serial = Student_Admission.AdmissionSerial (ক্রম ঠিক রাখতে + কলামে দেখাতে)
// ⭐ admissionId = দুই পাশেই Student_Admission.AdmissionID — সিরিয়াল এক হলে টাই ভাঙতে লাগে
// ⭐ inactive = ইউজার ইনঅ্যাক্টিভ (UserAction ≠ 1) — শুধু ডান পাশে আসতে পারে,
//    বাম পাশে বেকএন্ডই ইনঅ্যাক্টিভদের বাদ দিয়ে দেয়
const toRow = (id, user, subClass = "", serial = null, admissionId = null, inactive = false) => ({
  id,
  code: user?.UserCode ?? "",
  name: user?.UserName ? (user.UserName) : "",
  subClass: subClass ? (subClass) : "",
  serial: serial ?? null,
  admissionId: admissionId ?? null,
  inactive: Boolean(inactive),
});

// ⭐ AdmissionSerial ধরে ascending — backend-এর নিয়মের সাথে মিলিয়ে।
//    কলামটা STRING, তাই সংখ্যা ধরে তুলনা। সিরিয়াল খালি থাকলে সবার শেষে।
//    সিরিয়াল এক হলে AdmissionID দিয়ে টাই-ব্রেক।
const serialValue = (value) => {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const num = Number(String(value).trim());
  return Number.isFinite(num) ? num : null;
};

const compareBySerial = (a, b) => {
  const sa = serialValue(a?.serial);
  const sb = serialValue(b?.serial);

  if (sa !== null && sb !== null) {
    if (sa !== sb) return sa - sb;
  } else if (sa !== null) {
    return -1;
  } else if (sb !== null) {
    return 1;
  } else {
    const ta = String(a?.serial ?? "");
    const tb = String(b?.serial ?? "");
    if (ta !== tb) return ta.localeCompare(tb, "bn");
  }

  return (Number(a?.admissionId) || 0) - (Number(b?.admissionId) || 0);
};

function matchesFilter(s, filter) {
  if (!filter.trim()) return true;
  const q = filter.trim().toLowerCase();
  return (
    (s.name || "").toLowerCase().includes(q) ||
    String(s.code ?? "").toLowerCase().includes(q) ||
    String(s.serial ?? "").toLowerCase().includes(q) ||
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

/* ⭐ রিডিজাইন — হেডারের ভেতরের স্বচ্ছ সাদা চিপ */
function HeaderChip({ label, value }) {
  return (
    <div className="h-[38px] flex items-center gap-2 rounded-xl border border-white/25 bg-white/15 backdrop-blur px-4 whitespace-nowrap">
      <span className="text-xs font-medium text-white/80">{label}</span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
}

/* ---------------------------------------------------------
   List panel
--------------------------------------------------------- */

function ListPanel({
  title, subTitle, titleColor, rows, totalCount, checkedSet, onToggleAll, onToggleOne,
  filter, onFilterChange, filterLabel, filterLabelColor,
  side, onRowDragStart, onRowDragEnd, onPanelDragOver, onPanelDragLeave, onPanelDrop,
  isDragTarget, draggingIds, emptyText, busy, canDrag = true, deniedMsg, accent = "violet",
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
            <div className="min-w-0">
              <h1 className={`text-[15px] font-bold leading-snug ${titleColor}`}>{title}</h1>
              {subTitle && <p className="text-xs text-slate-500 mt-0.5">{subTitle}</p>}
            </div>
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

        {/* permission না থাকলে প্যানেলের উপরেই জানিয়ে দেওয়া */}
        {!canDrag && deniedMsg && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
            <SvgIcon name="FiLock" size={13} />
            <span>{deniedMsg}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 ml-auto">
            {filterLabel && (
              <span className={`text-xs font-semibold ${filterLabelColor}`}>{filterLabel}</span>
            )}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <SvgIcon name="FiSearch" size={14} />
              </span>
              <input
                value={filter}
                onChange={(e) => onFilterChange(e.target.value)}
                placeholder="নাম / আইডি খুঁজুন"
                className="h-[34px] pl-8 pr-3 text-sm font-medium border border-slate-200 rounded-lg bg-white w-36 sm:w-44 outline-none transition focus:border-[#6D3BEF] focus:ring-2 focus:ring-[#6D3BEF]/15"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={`overflow-auto max-h-80 transition-opacity ${busy ? "opacity-60" : ""}`}>
        {/* ⭐ নতুন কলাম যোগ হওয়ায় min-w 520 → 580 */}
        <table className="w-full min-w-[580px] text-sm">
          <thead className="sticky top-0 bg-slate-50 text-[11px] font-semibold text-slate-500 tracking-wide z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
            <tr>
              <th className="px-3 py-2.5 text-left w-8">
                <Checkbox checked={allChecked} onChange={onToggleAll} disabled={!canDrag} />
              </th>
              {/* ⭐ ক্রম (ইনডেক্স) */}
              <th className="px-3 py-2.5 text-left w-10">ক্র:</th>
              {/* ⭐ ভর্তি সিরিয়াল — এই কলাম ধরেই তালিকা সাজানো */}
              <th className="px-3 py-2.5 text-left">ভর্তি সিরিয়াল</th>
              <th className="px-3 py-2.5 text-left">আইডি</th>
              <th className="px-3 py-2.5 text-left">শিক্ষার্থীর নাম</th>
              <th className="px-3 py-2.5 text-left">সাব ক্লাস</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                {/* ⭐ কলাম সংখ্যা ৫ → ৬ */}
                <td colSpan={6} className="text-center text-slate-400 italic py-10 text-sm">
                  {isDragTarget ? "এখানে ছেড়ে দিন" : emptyText || "কোনো শিক্ষার্থী পাওয়া যায়নি"}
                </td>
              </tr>
            ) : (
              rows.map((s, index) => {
                const checked = checkedSet.has(s.id);
                const isDragging = draggingIds.includes(s.id);
                const draggable = !busy && canDrag;

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
                    draggable={draggable}
                    onDragStart={onRowDragStart(side, s.id)}
                    onDragEnd={onRowDragEnd}
                    title={
                      s.inactive
                        ? "এই শিক্ষার্থী ইনঅ্যাক্টিভ"
                        : canDrag
                        ? "ড্র্যাগ করে অন্য পাশে ছেড়ে দিন"
                        : deniedMsg || "আপনার অনুমতি নেই"
                    }
                    className={`border-b border-slate-50 last:border-0 transition-colors select-none ${
                      !canDrag
                        ? "cursor-not-allowed"
                        : busy
                        ? "cursor-wait"
                        : "cursor-grab active:cursor-grabbing"
                    } ${rowTone} ${isDragging ? "opacity-40" : ""}`}
                  >
                    <td className="px-3 py-3">
                      <Checkbox
                        checked={checked}
                        onChange={(v) => onToggleOne(s.id, v)}
                        disabled={!canDrag}
                      />
                    </td>
                    {/* ⭐ ক্রম — সাজানো তালিকার ইনডেক্স */}
                    <td className={`px-3 py-3 ${s.inactive ? "text-rose-500" : "text-slate-400"}`}>
                      {bn(index + 1)}
                    </td>
                    {/* ⭐ ভর্তি সিরিয়াল */}
                    <td className={`px-3 py-3 font-mono ${s.inactive ? "text-rose-700" : "text-slate-600"}`}>
                      {s.serial ? bn(s.serial) : "—"}
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
                    <td className={`px-3 py-3 whitespace-nowrap ${s.inactive ? "text-rose-700" : "text-slate-600"}`}>
                      {s.subClass || "—"}
                    </td>
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

export default function ExamStudentGroupCreate() {
  const [session, setSession] = useState(null);
  const [examId, setExamId] = useState(null);
  const [fromSubClass, setFromSubClass] = useState(null);
  const [toSubClass, setToSubClass] = useState(null);

  /* ---------------- ফিল্টার ডাটা ---------------- */
  const { data: filterData } = useGetStudentGroupFiltersQuery();
  const sessionTree = useMemo(() => filterData?.sessions || [], [filterData]);
  const allSubClasses = useMemo(() => filterData?.subClasses || [], [filterData]);

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

  const fromSubClassOptions = useMemo(
    () =>
      allSubClasses.map((c) => ({
        value: c.SubClassID,
        name: c.SubClass ? (c.SubClass) : "",
      })),
    [allSubClasses]
  );

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

  const fromSubClassName = fromSubClassOptions.find((o) => String(o.value) === String(fromSubClass))?.name || "";
  const toSubClassName = toSubClassOptions.find((o) => String(o.value) === String(toSubClass))?.name || "";

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

  const busy = isAdding || isRemoving || isListFetching;

  const [available, setAvailable] = useState([]);
  const [group, setGroup] = useState([]);

  const [availableChecked, setAvailableChecked] = useState(new Set());
  const [groupChecked, setGroupChecked] = useState(new Set());
  const [availableFilter, setAvailableFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");

  const [toast, setToast] = useState(null);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    // ⭐ বেকএন্ডেই UserAction = 1 ফিল্টার করা, তাই বাম পাশে সবাই একটিভ
    setAvailable(
      (listData?.available || []).map((a) =>
        toRow(a.AdmissionID, a.User, fromSubClassName, a.AdmissionSerial, a.AdmissionID, false)
      )
    );
    // ⭐ ডান পাশে ইনঅ্যাক্টিভ শিক্ষার্থীও দেখাবে — IsInactive ফ্ল্যাগ দিয়ে রো লাল হবে
    setGroup(
      (listData?.added || []).map((r) =>
        toRow(r.ID, r.User, r.SourceSubClass, r.AdmissionSerial, r.AdmissionID, r.IsInactive)
      )
    );
    setAvailableChecked(new Set());
    setGroupChecked(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listData]);

  useEffect(() => {
    setApiError(null);
  }, [session, examId, fromSubClass, toSubClass]);

  /* ---------------- ফিল্টার ---------------- */
  const availableRows = useMemo(
    () => available.filter((s) => matchesFilter(s, availableFilter)).sort(compareBySerial),
    [available, availableFilter]
  );
  const groupRows = useMemo(
    () => group.filter((s) => matchesFilter(s, groupFilter)).sort(compareBySerial),
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

  const moveIdsToGroup = async (ids) => {
    if (!toSubClass) {
      setApiError("আগে 'সাব ক্লাশ পর্যন্ত' নির্বাচন করুন");
      return;
    }
    const idSet = new Set(ids);
    const moving = available.filter((s) => idSet.has(s.id));
    if (moving.length === 0 || !filtersReady) return;

    setApiError(null);

    let result;
    try {
      result = await addStudentGroup({
        SessionID: session,
        ExamID: examId,
        FromSubClassID: fromSubClass,
        ToSubClassID: toSubClass,
        AdmissionIDs: moving.map((s) => s.id),
      }).unwrap();
    } catch (err) {
      setApiError(err?.data?.error || err?.data?.detail || "শিক্ষার্থী যোগ করা যায়নি");
      return;
    }

    const conflictStudents = result?.conflictStudents || [];
    const conflictIDs = new Set(conflictStudents.map((c) => c.AdmissionID));

    const movedRows = moving.filter((s) => !conflictIDs.has(s.id));
    const movedIDs = new Set(movedRows.map((s) => s.id));

    setAvailable((prev) => prev.filter((s) => !movedIDs.has(s.id)));
    setGroup((prev) => [...prev, ...movedRows]);
    setAvailableChecked((prev) => {
      const next = new Set(prev);
      movedIDs.forEach((id) => next.delete(id));
      return next;
    });

    if (conflictStudents.length > 0) {
      const names = conflictStudents
        .map((c) => c.UserName || `আইডি ${c.UserCode ?? c.UserID}`)
        .join(", ");

      setApiError(
        result?.message || `পূর্বে অন্য কোন ক্লাসে ${names}কে তালিকা তৈরি করা হয়েছে।`
      );
    } else {
      setToast(`${bn(movedRows.length)} জন শিক্ষার্থী গ্রুপে যোগ হয়েছে`);
      setTimeout(() => setToast(null), 2600);
    }
  };

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
    setGroupChecked((prev) => {
      const next = new Set(prev);
      idSet.forEach((id) => next.delete(id));
      return next;
    });
    setToast(`${bn(moving.length)} জন শিক্ষার্থীকে গ্রুপ থেকে সরানো হয়েছে`);
    setTimeout(() => setToast(null), 2600);
  };

  /* ---------------- Drag & Drop ---------------- */
  const [dragInfo, setDragInfo] = useState(null);
  const [dragOverSide, setDragOverSide] = useState(null);

  const handleRowDragStart = (side, id) => (e) => {
    if (busy) {
      e.preventDefault();
      return;
    }
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

  const handleAddSelected = () => {
    if (availableChecked.size === 0) {
      setApiError("আগে বাম পাশ থেকে শিক্ষার্থী নির্বাচন করুন");
      return;
    }
    moveIdsToGroup(Array.from(availableChecked));
  };

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

  const selectedTotal = availableChecked.size + groupChecked.size;

  /* ⭐ রিডিজাইন — ধাপ নির্দেশক */
  const steps = [
    { label: "শিক্ষাবর্ষ", done: Boolean(session) },
    { label: "পরীক্ষা", done: Boolean(examId) },
    { label: "সাব ক্লাস হতে", done: Boolean(fromSubClass) },
    { label: "সাব ক্লাশ পর্যন্ত", done: Boolean(toSubClass) },
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
                <h1 className="text-lg sm:text-xl font-bold text-white leading-tight">পরীক্ষার্থী গ্রুপ তৈরি</h1>
                <p className="text-[12px] sm:text-[13px] text-white/80 leading-snug">
                  শিক্ষাবর্ষ → পরীক্ষা → সাব ক্লাস হতে নির্বাচন করুন, এরপর সাব ক্লাশ পর্যন্ত বেছে নিয়ে ড্র্যাগ করে গ্রুপে নিন
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <HeaderChip label="নির্বাচিত" value={`${bn(selectedTotal)} জন`} />
              <HeaderChip label="গ্রুপে" value={`${bn(group.length)} জন`} />
            </div>
          </div>
        </header>

        {/* ============================================================
            ⭐ রিডিজাইন — ফিল্টার কার্ড + ধাপ নির্দেশক
        ============================================================ */}
        <FormProvider {...filterMethods}>
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 mb-4 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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
          </section>
        </FormProvider>

        {apiError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600 w-full">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            {apiError}
          </div>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-start w-full">
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
            filterLabel="ফিল্টার"
            filterLabelColor="text-slate-500"
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
            canDrag={true}
            accent="violet"
          />

          {/* ⭐ বাম ↔ ডান মুভ করার অ্যারো বাটন */}
          <div className="flex flex-col lg:flex-col items-center justify-center gap-3 lg:self-center lg:py-6">
            <button
              type="button"
              title="নির্বাচিত শিক্ষার্থীদের গ্রুপে নিন"
              onClick={() => moveIdsToGroup(Array.from(availableChecked))}
              disabled={busy || availableChecked.size === 0}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-[#6D3BEF] to-[#22B8F0] text-white shadow-md shadow-[#6D3BEF]/20 transition hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:brightness-100"
            >
              <svg className="w-5 h-5 rotate-90 lg:rotate-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="13 6 19 12 13 18" />
              </svg>
            </button>

            <button
              type="button"
              title="নির্বাচিত শিক্ষার্থীদের গ্রুপ থেকে সরান"
              onClick={() => moveIdsToAvailable(Array.from(groupChecked))}
              disabled={busy || groupChecked.size === 0}
              className="w-11 h-11 flex items-center justify-center rounded-full border border-[#6D3BEF]/25 bg-white text-[#6D3BEF] shadow-sm transition hover:bg-[#6D3BEF] hover:text-white active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#6D3BEF]"
            >
              <svg className="w-5 h-5 rotate-90 lg:rotate-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="11 6 5 12 11 18" />
              </svg>
            </button>
          </div>

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
            filterLabel="ফিল্টার"
            filterLabelColor="text-slate-500"
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
            canDrag={true}
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