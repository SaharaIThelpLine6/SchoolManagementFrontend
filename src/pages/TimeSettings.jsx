import React, { useMemo, useState } from "react";

/* ------------------------------------------------------------------ *
 * TimeSetting.jsx  –  Attendance machine time setting (Tailwind only)
 * Tab 1: Switch rules (Check-In / Check-Out / Break-In / Break-Out)
 * Tab 2: Assign users to a shift
 * Replace the SAMPLE_* data and the TODO API calls with your backend.
 * ------------------------------------------------------------------ */

// Badge colour per switch type (full class names so Tailwind can see them)
const SWITCH_STYLE = {
  "Check-In": "bg-emerald-600",
  "Check-Out": "bg-rose-600",
  "Break-In": "bg-amber-600",
  "Break-Out": "bg-sky-600",
};
const SWITCHES = Object.keys(SWITCH_STYLE);
const SHIFTS = ["প্রথম শিফট", "দ্বিতীয় শিফট"];

// ---- sample data (same rows as your old screen) ----
const SAMPLE_RULES = [
  { id: 1, shift: SHIFTS[0], sw: "Check-In", start: "07:00:00", late: "19:00:00", end: "19:00:01" },
  { id: 4, shift: SHIFTS[0], sw: "Check-Out", start: "19:00:02", late: "20:00:00", end: "20:00:00" },
  { id: 5, shift: SHIFTS[1], sw: "Check-In", start: "11:00:00", late: "12:00:00", end: "12:20:00" },
  { id: 6, shift: SHIFTS[1], sw: "Check-Out", start: "13:00:00", late: "15:00:00", end: "15:00:00" },
  { id: 7, shift: SHIFTS[0], sw: "Break-In", start: "16:00:00", late: "16:30:00", end: "17:00:00" },
  { id: 8, shift: SHIFTS[0], sw: "Break-Out", start: "18:00:00", late: "18:30:00", end: "19:00:00" },
];
const SAMPLE_USERS = [
  { key: 1, code: 1001, name: "আব্দুল রহমান", father: "ঈ:টংবৎ", shift: "দ্বিতীয় শিফট", schedule: "বিরতি-প্রস্থান", type: "শিক্ষক" },
  { key: 2, code: 1102, name: "মোহাম্মদ নিয়ামুল হক", father: "ঈ:টংবৎ", shift: "দ্বিতীয় শিফট", schedule: "বিরতি-আগমন", type: "শিক্ষক" },
  { key: 3, code: 1102, name: "মোহাম্মদ নিয়ামুল হক", father: "ঈ:টংবৎ", shift: "প্রথম শিফট", schedule: "আগমন", type: "শিক্ষক" },
  { key: 4, code: 1102, name: "মোহাম্মদ নিয়ামুল হক", father: "ঈ:টংবৎ", shift: "প্রথম শিফট", schedule: "প্রস্থান", type: "শিক্ষক" },
  // shift: "" means the user is NOT assigned to any shift yet
  { key: 5, code: 1203, name: "আবু বকর সিদ্দিক", father: "ঈ:টংবৎ", shift: "", schedule: "", type: "কর্মচারী" },
  { key: 6, code: 1204, name: "ফাতেমা খাতুন", father: "ঈ:টংবৎ", shift: "", schedule: "", type: "শিক্ষক" },
];
const UNASSIGNED = "__none__"; // filter / target value for "no shift"

// "HH:MM:SS" -> % of the day (used for the timeline bar)
const toPct = (t) => {
  const [h, m, s] = t.split(":").map(Number);
  return ((h * 3600 + m * 60 + (s || 0)) / 86400) * 100;
};
// <input type="time" step="1"> may return HH:MM, always store HH:MM:SS
const withSeconds = (t) => (t && t.length === 5 ? `${t}:00` : t);

// ---- shared Tailwind class strings ----
const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";
const labelCls = "mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400";
const btnPrimary =
  "rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40";
const btnGhost =
  "rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700";
const cardCls =
  "rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900";

export default function TimeSetting() {
  const [tab, setTab] = useState("rules");
  const [toast, setToast] = useState("");

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-2 bg-teal-800 px-5 py-3 text-white">
        <h1 className="text-lg font-semibold">
          Attendance Time Setting
          <span className="ml-2 text-sm font-normal text-teal-100">হাজিরা সময় নির্ধারণ</span>
        </h1>
        {/* TODO: call your refresh API here */}
        <button
          onClick={() => notify("Data refreshed")}
          className="rounded-lg border border-white/40 px-3 py-1.5 text-sm hover:bg-white/10"
        >
          Refresh data
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 px-5 pt-3">
        {[
          ["rules", "Switch rules · সময়সূচি"],
          ["assign", "Assign users · ব্যবহারকারী"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-t-lg border-b-2 px-4 py-2 text-sm font-medium ${
              tab === id
                ? "border-teal-700 bg-white text-teal-700 dark:bg-slate-900 dark:text-teal-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <main className="px-5 pb-6">
        <div className="rounded-b-xl rounded-tr-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          {tab === "rules" ? <RulesTab notify={notify} /> : <AssignTab notify={notify} />}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-teal-700 px-5 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

/* ====================== TAB 1 : SWITCH RULES ====================== */
function RulesTab({ notify }) {
  const [rules, setRules] = useState(SAMPLE_RULES);
  const [editId, setEditId] = useState(null);
  const empty = { shift: SHIFTS[0], sw: "Check-In", start: "", late: "", end: "" };
  const [form, setForm] = useState(empty);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onNew = () => {
    setEditId(null);
    setForm(empty);
  };
  const onEdit = (r) => {
    setEditId(r.id);
    setForm({ shift: r.shift, sw: r.sw, start: r.start, late: r.late, end: r.end });
  };
  const onDelete = (id) => {
    // TODO: DELETE /api/switch-rules/:id
    if (window.confirm(`Delete rule #${id}?`)) setRules(rules.filter((r) => r.id !== id));
  };
  const onSave = () => {
    if (!form.start || !form.late || !form.end) return notify("Fill all three times");
    const data = {
      shift: form.shift,
      sw: form.sw,
      start: withSeconds(form.start),
      late: withSeconds(form.late),
      end: withSeconds(form.end),
    };
    // TODO: POST / PUT /api/switch-rules
    if (editId) setRules(rules.map((r) => (r.id === editId ? { ...r, ...data } : r)));
    else setRules([...rules, { id: Math.max(0, ...rules.map((r) => r.id)) + 1, ...data }]);
    onNew();
    notify("Saved");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      {/* Form */}
      <div className={cardCls}>
        <h2 className="mb-3 text-sm font-semibold">{editId ? `Edit rule #${editId}` : "New rule"}</h2>
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Shift name</label>
            <select className={inputCls} value={form.shift} onChange={set("shift")}>
              {SHIFTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Switch name</label>
            <select className={inputCls} value={form.sw} onChange={set("sw")}>
              {SWITCHES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Start time</label>
              <input type="time" step="1" className={inputCls} value={form.start} onChange={set("start")} />
            </div>
            <div>
              <label className={labelCls}>Start late</label>
              <input type="time" step="1" className={inputCls} value={form.late} onChange={set("late")} />
            </div>
          </div>
          <div>
            <label className={labelCls}>End time</label>
            <input type="time" step="1" className={inputCls} value={form.end} onChange={set("end")} />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button className={btnPrimary} onClick={onSave}>Save</button>
          <button className={btnGhost} onClick={onNew}>New</button>
        </div>
      </div>

      {/* One card per shift: its own timeline + table */}
      <div className="space-y-4">
        {SHIFTS.map((shift) => {
          const shiftRules = rules.filter((r) => r.shift === shift);
          return (
            <div key={shift} className={cardCls}>
              <h2 className="mb-3 text-sm font-semibold">
                {shift} <span className="font-normal text-slate-500">({shiftRules.length})</span>
              </h2>

              {/* 24h timeline. left/width are dynamic, so these two use inline style */}
              <div className="relative h-6 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-700">
                {shiftRules.map((r) => {
                  const a = toPct(r.start);
                  const b = Math.max(toPct(r.end), a + 0.4);
                  return (
                    <div
                      key={r.id}
                      title={`${r.sw} ${r.start} – ${r.end}`}
                      className={`absolute inset-y-0 opacity-80 ${SWITCH_STYLE[r.sw]}`}
                      style={{ left: `${a}%`, width: `${b - a}%` }}
                    />
                  );
                })}
              </div>
              <div className="mt-1 flex justify-between text-[11px] text-slate-500">
                <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs text-slate-500 dark:border-slate-700">
                      {["ID", "Switch", "Start", "Late", "End", ""].map((h) => (
                        <th key={h} className="whitespace-nowrap px-2 py-2 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {shiftRules.map((r) => (
                      <tr key={r.id} className="border-b border-slate-100 hover:bg-teal-50 dark:border-slate-800 dark:hover:bg-slate-800">
                        <td className="px-2 py-2">{r.id}</td>
                        <td className="px-2 py-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${SWITCH_STYLE[r.sw]}`}>{r.sw}</span>
                        </td>
                        <td className="px-2 py-2 tabular-nums">{r.start}</td>
                        <td className="px-2 py-2 tabular-nums">{r.late}</td>
                        <td className="px-2 py-2 tabular-nums">{r.end}</td>
                        <td className="whitespace-nowrap px-2 py-2 text-right">
                          <button title="Edit" onClick={() => onEdit(r)} className="rounded px-2 py-1 hover:bg-slate-200 dark:hover:bg-slate-700">✎</button>
                          <button title="Delete" onClick={() => onDelete(r.id)} className="rounded px-2 py-1 hover:bg-slate-200 dark:hover:bg-slate-700">🗑</button>
                        </td>
                      </tr>
                    ))}
                    {shiftRules.length === 0 && (
                      <tr><td colSpan={6} className="px-2 py-4 text-center text-slate-500">No rules for this shift yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ====================== TAB 2 : ASSIGN USERS ====================== */
function AssignTab({ notify }) {
  const [users, setUsers] = useState(SAMPLE_USERS);
  const [picked, setPicked] = useState(new Set()); // set of user.key
  const [q, setQ] = useState("");
  const [fType, setFType] = useState("");
  const [fShift, setFShift] = useState("");
  const [target, setTarget] = useState(SHIFTS[0]);

  // apply the filters
  const list = useMemo(() => users.filter((u) =>
          (!fType || u.type === fType) &&
          (!fShift || (fShift === UNASSIGNED ? !u.shift : u.shift === fShift)) &&
          (!q || `${u.code}${u.name}`.toLowerCase().includes(q.trim().toLowerCase()))
      ),
    [users, q, fType, fShift]
  );

  const toggle = (key) => {
    const next = new Set(picked);
    next.has(key) ? next.delete(key) : next.add(key);
    setPicked(next);
  };
  const allOn = list.length > 0 && list.every((u) => picked.has(u.key));
  const toggleAll = () => {
    const next = new Set(picked);
    list.forEach((u) => (allOn ? next.delete(u.key) : next.add(u.key)));
    setPicked(next);
  };

  const onAssign = () => {
    // TODO: POST /api/user-shift  { userKeys: [...picked], shift: target }
    setUsers(users.map((u) => (picked.has(u.key) ? { ...u, shift: target === UNASSIGNED ? "" : target } : u)));
    notify(`${picked.size} user(s) assigned`);
    setPicked(new Set());
  };

  return (
    <>
      {/* Filters */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <div>
          <label className={labelCls}>User type</label>
          <select className={inputCls} value={fType} onChange={(e) => setFType(e.target.value)}>
            <option value="">All</option><option>শিক্ষক</option><option>কর্মচারী</option><option>শিক্ষার্থী</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Session</label>
          <select className={inputCls}><option>All</option><option>2026</option></select>
        </div>
        <div>
          <label className={labelCls}>Class</label>
          <select className={inputCls}><option>All</option></select>
        </div>
        <div>
          <label className={labelCls}>Residence</label>
          <select className={inputCls}><option>All</option><option>আবাসিক</option><option>অনাবাসিক</option></select>
        </div>
        <div>
          <label className={labelCls}>Shift</label>
          <select className={inputCls} value={fShift} onChange={(e) => setFShift(e.target.value)}>
            <option value="">All</option>
            {SHIFTS.map((s) => <option key={s}>{s}</option>)}
            <option value={UNASSIGNED}>Unassigned only</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Search</label>
          <input className={inputCls} placeholder="Code or name…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        {/* Users table */}
        <div className={`${cardCls} overflow-x-auto`}>
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
            <span>{list.length} user(s) shown</span>
            <button className="text-teal-700 hover:underline dark:text-teal-400" onClick={() => setFShift(UNASSIGNED)}>
              {users.filter((u) => !u.shift).length} unassigned · show
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500 dark:border-slate-700">
                <th className="px-2 py-2"><input type="checkbox" checked={allOn} onChange={toggleAll} /></th>
                {["Code", "Name", "Father", "Shift", "Schedule"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-2 py-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.key} className="border-b border-slate-100 hover:bg-teal-50 dark:border-slate-800 dark:hover:bg-slate-800">
                  <td className="px-2 py-2"><input type="checkbox" checked={picked.has(u.key)} onChange={() => toggle(u.key)} /></td>
                  <td className="px-2 py-2 tabular-nums">{u.code}</td>
                  <td className="whitespace-nowrap px-2 py-2">{u.name}</td>
                  <td className="px-2 py-2">{u.father}</td>
                  <td className="whitespace-nowrap px-2 py-2">
                    {u.shift || (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">Unassigned</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2">{u.schedule || "—"}</td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={6} className="px-2 py-6 text-center text-slate-500">No users match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Selected panel */}
        <div className={cardCls}>
          <h2 className="mb-3 text-sm font-semibold">
            Selected <span className="font-normal text-slate-500">({picked.size})</span>
          </h2>
          <label className={labelCls}>Assign to shift</label>
          <select className={inputCls} value={target} onChange={(e) => setTarget(e.target.value)}>
            {SHIFTS.map((s) => <option key={s}>{s}</option>)}
            <option value={UNASSIGNED}>— Remove from shift —</option>
          </select>

          <ul className="mt-3 max-h-64 divide-y divide-slate-100 overflow-auto text-sm dark:divide-slate-800">
            {[...picked].map((k) => {
              const u = users.find((x) => x.key === k);
              return (
                <li key={k} className="flex items-center justify-between py-1.5">
                  <span>{u.code} · {u.name}</span>
                  <button onClick={() => toggle(k)} className="rounded px-2 hover:bg-slate-200 dark:hover:bg-slate-700">✕</button>
                </li>
              );
            })}
          </ul>
          {picked.size === 0 && <p className="mt-3 text-sm text-slate-500">Tick users in the table to add them here.</p>}

          <button className={`${btnPrimary} mt-4`} disabled={!picked.size} onClick={onAssign}>
            Save assignment
          </button>
        </div>
      </div>
    </>
  );
}