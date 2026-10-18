import { useEffect, useMemo, useState } from 'react';
import {
  columnsForLanguage,
  resolveColumns,
  reorderColumns,
  toggleColumn,
  clampWidth,
  langCode,
  listName,
  defaultFeeListSettings,
  loadFeeListSettings,
  saveFeeListSettings,
  toBn,
  MAX_COLUMNS,
  WIDTH_MIN,
  WIDTH_MAX,
} from '../../Data/feeListColumns';

// =============================================================================
// পরীক্ষার ফি তালিকার সেটিংস
//
// দুইটা অংশ:
//
//   ১) "কী কী দেখাবে" — টিক দিয়ে ঘর বাছাই, MAX_COLUMNS এর সীমার মধ্যে।
//      সীমায় পৌঁছে গেলে বাকিগুলো নিষ্ক্রিয় হয়ে যায়, কারণ এর বেশি ঘর
//      বসালে প্রতিটা ঘর এত সরু হয় যে নাম পড়া কষ্ট হয়ে যায়।
//
//   ২) কাগজের হেডার — ঠিক যেভাবে ছাপা হবে সেভাবেই দেখায়। ওখানেই:
//        • ঘরের নামে চাপ দিয়ে নতুন নাম লেখা
//        • ⠿ ধরে টেনে ক্রম বদলানো
//        • ↔ দিয়ে ঘরের জায়গা কমানো-বাড়ানো
//        • ✕ দিয়ে ঘরটা সরিয়ে ফেলা
//
// ফর্মে যে ভাষা বাছা হয়েছে সেই ভাষার ঘরগুলোই কেবল দেখায়, আর সেটিংসও
// ভাষা ও তালিকার ধরন অনুযায়ী আলাদা সেভ হয়।
// =============================================================================

const GROUP_OF = {
  SL: 'শনাক্তকরণ',
  AdmissionSerial: 'শনাক্তকরণ',
  UserCode: 'শনাক্তকরণ',

  UserName: 'নাম ও পরিচয়',
  FatherName: 'নাম ও পরিচয়',
  MotherName: 'নাম ও পরিচয়',
  ArabicName: 'নাম ও পরিচয়',
  ArabicFather: 'নাম ও পরিচয়',
  ArabicShortAdd: 'নাম ও পরিচয়',
  Mobile1: 'নাম ও পরিচয়',
  DateOfBirth: 'নাম ও পরিচয়',

  SubClass: 'শ্রেণি ও পরীক্ষা',
  SessionName: 'শ্রেণি ও পরীক্ষা',
  ExamName: 'শ্রেণি ও পরীক্ষা',
  SubClassAra: 'শ্রেণি ও পরীক্ষা',
  SessionAraName: 'শ্রেণি ও পরীক্ষা',
  ExamAraName: 'শ্রেণি ও পরীক্ষা',

  Fee: 'টাকার হিসাব',
  Less: 'টাকার হিসাব',
  PayAmount: 'টাকার হিসাব',
  DueAmount: 'টাকার হিসাব',
  FeeStatus: 'টাকার হিসাব',

  Signature: 'হাতে লেখার ঘর',
  Remark: 'হাতে লেখার ঘর',
};

const GROUP_ORDER = [
  'শনাক্তকরণ',
  'নাম ও পরিচয়',
  'শ্রেণি ও পরীক্ষা',
  'টাকার হিসাব',
  'হাতে লেখার ঘর',
];

/** টিকের ঘর — নীল বাক্স, ভেতরে সাদা টিক */
const CheckBox = ({ checked }) => (
  <span
    className={`h-[18px] w-[18px] rounded-[5px] border-2 flex items-center justify-center shrink-0 transition-colors ${
      checked ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'
    }`}
  >
    {checked && (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"
        strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 block">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )}
  </span>
);

const FeeListSettingsModal = ({ open, onClose, listType = 1, language = 1, onSaved }) => {
  const [settings, setSettings] = useState(() => defaultFeeListSettings(language));
  const [savedFlash, setSavedFlash] = useState(false);

  // টেনে সাজানোর অবস্থা
  const [dragKey, setDragKey] = useState(null);
  const [overKey, setOverKey] = useState(null);
  // কোন ঘরের গ্রিপ চেপে ধরা আছে — ঘরের ভেতরের ইনপুটে লিখতে গিয়ে যেন
  // ড্র্যাগ শুরু না হয়ে যায়, তাই শুধু গ্রিপ ধরলেই ঘরটা টানা যায়
  const [grabbed, setGrabbed] = useState(null);
  // কোন ঘরের জায়গা বদলানো হচ্ছে
  const [widthKey, setWidthKey] = useState(null);
  // উপরে আটকানো হেডার প্রিভিউটা খোলা আছে কিনা — ছোট পর্দায় জায়গা
  // ছাড়তে চাইলে ভাঁজ করে রাখা যায়
  const [previewOpen, setPreviewOpen] = useState(true);

  useEffect(() => {
    if (open) {
      setSettings(loadFeeListSettings(listType, language));
      setSavedFlash(false);
      setWidthKey(null);
    }
  }, [open, listType, language]);

  // এই ভাষার ঘরগুলো, দলে সাজানো
  const groups = useMemo(() => {
    const allowed = columnsForLanguage(language);
    const byGroup = new Map();

    allowed.forEach((col) => {
      const name = GROUP_OF[col.key] || 'অন্যান্য';
      if (!byGroup.has(name)) byGroup.set(name, []);
      byGroup.get(name).push(col);
    });

    return GROUP_ORDER.filter((name) => byGroup.has(name)).map((name) => ({
      title: name,
      cols: byGroup.get(name),
    }));
  }, [language]);

  // হেডার প্রিভিউর ঘরগুলো — কাগজে যেভাবে যাবে ঠিক সেভাবেই
  const previewColumns = useMemo(
    () => resolveColumns(settings, language),
    [settings, language]
  );

  const visible = settings.visible || [];
  const isOn = (key) => visible.includes(key);
  const isFull = visible.length >= MAX_COLUMNS;

  const toggle = (key) => {
    setSettings((s) => ({ ...s, visible: toggleColumn(s.visible, key, language) }));
    setWidthKey((k) => (k === key ? null : k));
  };

  const rename = (key, value) => {
    setSettings((s) => ({ ...s, labels: { ...(s.labels || {}), [key]: value } }));
  };

  const setWidth = (key, value) => {
    const w = clampWidth(value);
    setSettings((s) => ({ ...s, widths: { ...(s.widths || {}), [key]: w } }));
  };

  const clearWidth = (key) => {
    setSettings((s) => {
      const next = { ...(s.widths || {}) };
      delete next[key];
      return { ...s, widths: next };
    });
  };

  // ---- টেনে সাজানো
  const handleDragStart = (key) => (e) => {
    setDragKey(key);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', key);
    } catch {
      // কিছু ব্রাউজারে setData না দিলে ড্র্যাগ শুরুই হয় না
    }
  };

  const handleDragOver = (key) => (e) => {
    if (!dragKey || dragKey === key) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverKey(key);
  };

  const handleDrop = (key) => (e) => {
    e.preventDefault();
    if (dragKey && dragKey !== key) {
      setSettings((s) => ({ ...s, visible: reorderColumns(s.visible, dragKey, key) }));
    }
    setDragKey(null);
    setOverKey(null);
    setGrabbed(null);
  };

  const handleDragEnd = () => {
    setDragKey(null);
    setOverKey(null);
    setGrabbed(null);
  };

  const resetAll = () => {
    setSettings(defaultFeeListSettings(language));
    setWidthKey(null);
  };

  const handleSave = () => {
    saveFeeListSettings(listType, language, settings);
    setSavedFlash(true);
    onSaved?.(settings);
    setTimeout(() => onClose?.(), 350);
  };

  if (!open) return null;

  const currentListName = listName(listType);
  const langName = langCode(language) === 'ar' ? 'আরবি' : 'বাংলা';
  const widthCol = widthKey ? previewColumns.find((c) => c.key === widthKey) : null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 print:hidden">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* ── রঙিন হেডার ─────────────────────────────── */}
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 px-6 py-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          <div className="min-w-0">
            <h2 className="text-white font-bold text-lg leading-tight">তালিকার সেটিংস</h2>
            <p className="text-white/80 text-xs mt-0.5 truncate">{currentListName}</p>
          </div>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">
              <span className="h-2 w-2 rounded-full bg-sky-300" />
              ভাষা: {langName}
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white ${
              isFull ? 'bg-amber-500/80' : 'bg-white/15'
            }`}>
              <span className={`h-2 w-2 rounded-full ${isFull ? 'bg-white' : 'bg-emerald-300'}`} />
              {toBn(visible.length)} / {toBn(MAX_COLUMNS)}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition"
              title="বন্ধ করুন"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ═══ কাগজের হেডার — উপরে আটকানো ═══════════════

            এটা স্ক্রল হওয়া অংশের বাইরে, তাই নিচে যতই স্ক্রল করুন সরে না।
            ফলে কোনো ঘর টিক দিলে বা নাম বদলালে বদলটা সাথে সাথেই চোখের
            সামনে দেখা যায় — আগের মতো উপরে ফিরে আসতে হয় না।
        */}
        <div className="shrink-0 bg-white border-b border-indigo-100 px-6 pt-4 pb-3 shadow-[0_3px_10px_-4px_rgba(15,23,42,0.18)]">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="h-4 w-1 rounded bg-indigo-500" />
            <h3 className="font-bold text-slate-800">কাগজের হেডার</h3>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600">
              উপরে আটকানো
            </span>

            <button
              type="button"
              onClick={() => setPreviewOpen((v) => !v)}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
              title={previewOpen ? 'ছোট করুন' : 'দেখুন'}
            >
              <svg
                className={`w-4 h-4 transition-transform ${previewOpen ? '' : '-rotate-90'}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
              {previewOpen ? 'ছোট করুন' : 'দেখুন'}
            </button>
          </div>

          <div className={previewOpen ? 'max-h-[44vh] overflow-y-auto pr-0.5' : 'hidden'}>

            <p className="text-xs text-slate-500 mb-3">
              কাগজে ঠিক এভাবেই ছাপা হবে। নামের ঘরে চাপ দিয়ে নতুন নাম লিখুন,
              <span className="mx-1 text-slate-400">⠿</span>
              ধরে টেনে ক্রম বদলান, আর
              <span className="mx-1 text-slate-400">↔</span>
              দিয়ে ঘরের জায়গা কমান-বাড়ান।
            </p>

            {previewColumns.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                উপর থেকে অন্তত একটা ঘর বেছে নিন
              </p>
            ) : (
              <>
                {/* প্রিভিউর টেবিলও কাগজের মতোই — বর্ডার ঘরের ভেতরে, তাই
                    ডান পাশের ঘরটা কেটে যায় না */}
                <style>{`
                  .fee-preview-table {
                    width: 100%; max-width: 100%;
                    table-layout: fixed;
                    border-collapse: separate; border-spacing: 0;
                  }
                  .fee-preview-table th, .fee-preview-table td {
                    border-right: 1px solid #cbd5e1;
                    border-bottom: 1px solid #cbd5e1;
                    overflow-wrap: anywhere; word-break: break-word;
                  }
                  .fee-preview-table th:first-child,
                  .fee-preview-table td:first-child { border-left: 1px solid #cbd5e1; }
                  .fee-preview-table thead th { border-top: 1px solid #cbd5e1; }
                `}</style>

                <div className="rounded-lg overflow-hidden">
                  <table
                    className="fee-preview-table"
                    style={{ fontSize: `${settings.fontSize || 13}px` }}
                  >
                    <colgroup>
                      {previewColumns.map((col, i) => {
                        const total = previewColumns.reduce((s, c) => s + (c.weight || 100), 0);
                        return (
                          <col key={col.key} style={{ width: `${((col.weight || 100) / total) * 100}%` }} />
                        );
                      })}
                    </colgroup>

                    <thead>
                      <tr className="bg-indigo-50">
                        {previewColumns.map((col) => {
                          const isDragging = dragKey === col.key;
                          const isOver = overKey === col.key && dragKey !== col.key;

                          return (
                            <th
                              key={col.key}
                              draggable={grabbed === col.key}
                              onDragStart={handleDragStart(col.key)}
                              onDragOver={handleDragOver(col.key)}
                              onDrop={handleDrop(col.key)}
                              onDragEnd={handleDragEnd}
                              className={`px-1.5 py-1.5 align-top transition-colors ${
                                isDragging ? 'opacity-40' : ''
                              } ${isOver ? 'bg-sky-200' : ''} ${
                                widthKey === col.key ? 'ring-2 ring-inset ring-indigo-400' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span
                                  onMouseDown={() => setGrabbed(col.key)}
                                  onMouseUp={() => setGrabbed(null)}
                                  title="ধরে টেনে সরান"
                                  className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-indigo-600 select-none leading-none px-0.5"
                                >
                                  ⠿
                                </span>

                                <span className="flex items-center gap-0.5">
                                  <button
                                    type="button"
                                    onClick={() => setWidthKey((k) => (k === col.key ? null : col.key))}
                                    title="জায়গা বদলান"
                                    className={`h-5 w-5 rounded flex items-center justify-center transition ${
                                      widthKey === col.key
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-slate-400 hover:bg-indigo-100 hover:text-indigo-600'
                                    }`}
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M8 9l-4 3 4 3m8-6l4 3-4 3M4 12h16" />
                                    </svg>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => toggle(col.key)}
                                    title="ঘরটা সরিয়ে ফেলুন"
                                    className="h-5 w-5 rounded text-slate-400 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </span>
                              </div>

                              <input
                                type="text"
                                value={settings.labels?.[col.key] ?? ''}
                                placeholder={col.label}
                                onChange={(e) => rename(col.key, e.target.value)}
                                draggable={false}
                                onDragStart={(e) => e.stopPropagation()}
                                title="চাপ দিয়ে নতুন নাম লিখুন"
                                className="w-full bg-transparent text-center font-bold text-slate-900 placeholder:text-slate-900 placeholder:font-bold rounded px-1 py-0.5 outline-none cursor-text hover:bg-white/70 focus:bg-white focus:ring-2 focus:ring-indigo-300"
                              />
                            </th>
                          );
                        })}
                      </tr>
                    </thead>

                    {/* নমুনা সারি — জায়গা আর সারিবদ্ধতা কেমন দেখাবে বোঝার জন্য */}
                    <tbody>
                      <tr className="text-slate-400">
                        {previewColumns.map((col) => (
                          <td
                            key={col.key}
                            className={`px-2 ${col.blank ? 'py-4' : 'py-1.5'}`}
                            style={{ textAlign: col.align || 'left' }}
                          >
                            {col.blank ? '' : '…'}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* জায়গার স্লাইডার — যে ঘরটা বাছা হয়েছে তার জন্য */}
                {widthCol && (
                  <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50/60 px-4 py-3 flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                      {widthCol.label} — জায়গা
                    </span>

                    <input
                      type="range"
                      min={WIDTH_MIN}
                      max={WIDTH_MAX}
                      step={5}
                      value={widthCol.weight || 120}
                      onChange={(e) => setWidth(widthCol.key, e.target.value)}
                      className="flex-1 min-w-[160px] accent-indigo-600"
                    />

                    <input
                      type="number"
                      min={WIDTH_MIN}
                      max={WIDTH_MAX}
                      value={widthCol.weight || ''}
                      onChange={(e) => setWidth(widthCol.key, e.target.value)}
                      className="w-20 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-center outline-none focus:border-indigo-400"
                    />

                    <button
                      type="button"
                      onClick={() => clearWidth(widthCol.key)}
                      className="text-sm text-slate-500 hover:text-indigo-700 font-medium whitespace-nowrap"
                    >
                      স্বয়ংক্রিয়
                    </button>

                    <button
                      type="button"
                      onClick={() => setWidthKey(null)}
                      className="ml-auto h-7 w-7 rounded-md text-slate-400 hover:bg-white hover:text-slate-700 flex items-center justify-center"
                      title="বন্ধ"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── বডি ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-slate-50/60 px-6 py-5 space-y-5">

          {/* ১. কী কী দেখাবে — টিকের পিল */}
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-bold text-slate-800">কী কী দেখাবে</h3>
              <span className="ml-auto text-xs text-slate-500">
                সর্বোচ্চ {toBn(MAX_COLUMNS)}টি ঘর
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              {isFull
                ? `${toBn(MAX_COLUMNS)}টি হয়ে গেছে — নতুন ঘর নিতে আগে একটা টিক তুলে নিন`
                : `কাগজে যাতে প্রতিটা ঘর আরামে বসে, তাই ${toBn(MAX_COLUMNS)}টির বেশি নেওয়া যায় না`}
            </p>

            <div className="space-y-3">
              {groups.map((g) => (
                <div key={g.title}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-3.5 w-1 rounded bg-blue-500" />
                    <span className="text-[13px] font-semibold text-slate-600">{g.title}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {g.cols.map((col) => {
                      const on = isOn(col.key);
                      const blocked = !on && isFull;

                      return (
                        <button
                          key={col.key}
                          type="button"
                          onClick={() => !blocked && toggle(col.key)}
                          disabled={blocked}
                          title={blocked ? `সর্বোচ্চ ${toBn(MAX_COLUMNS)}টি ঘর নেওয়া যায়` : undefined}
                          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-sm font-medium transition-all ${
                            on
                              ? 'bg-white border-slate-200 text-slate-800 shadow-sm'
                              : blocked
                                ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/40'
                          }`}
                        >
                          <CheckBox checked={on} />
                          {settings.labels?.[col.key]?.trim() || col.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ৩. কাগজের সেটিংস */}
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-slate-800 mb-1">কাগজের সেটিংস</h3>
            <p className="text-xs text-slate-500 mb-3">
              প্রতিষ্ঠানের লোগো বসে কাগজের মাথায়, নামের উপরে। জলছাপ বসে
              পাতার মাঝখানে, হালকা হয়ে লেখার পেছনে — দুইটা আলাদা ছবি।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { key: 'showHeader',    label: 'প্রতিষ্ঠানের শিরোনাম' },
                { key: 'showLogo',      label: 'প্রতিষ্ঠানের লোগো', hint: 'মাথায়' },
                { key: 'showWatermark', label: 'জলছাপ', hint: 'পেছনে' },
                { key: 'showSummary',   label: 'উপরে সারসংক্ষেপ' },
                { key: 'showTotalRow',  label: 'নিচে মোট সারি' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, [item.key]: !s[item.key] }))}
                  className="inline-flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 hover:border-blue-300 text-left"
                >
                  <CheckBox checked={settings[item.key] !== false} />
                  <span className="text-sm text-slate-700">{item.label}</span>
                  {item.hint && (
                    <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                      {item.hint}
                    </span>
                  )}
                </button>
              ))}

              {/* লোগো কোথায় বসবে — মাথার মাঝখানে, নাকি বাঁ পাশে */}
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                <label className="block text-[11px] text-slate-500 mb-1">লোগোর জায়গা</label>
                <div className="flex gap-1">
                  {[
                    { key: 'top',  label: 'মাঝখানে' },
                    { key: 'left', label: 'বাঁ পাশে' },
                  ].map((opt) => {
                    const on = (settings.logoPosition || 'top') === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        disabled={settings.showLogo === false}
                        onClick={() => setSettings((s) => ({ ...s, logoPosition: opt.key }))}
                        className={`flex-1 rounded-md px-2 py-1.5 text-sm font-medium transition ${
                          settings.showLogo === false
                            ? 'text-slate-300 cursor-not-allowed'
                            : on
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 sm:col-span-2 lg:col-span-1">
                <label className="block text-[11px] text-slate-500 mb-1">লেখার আকার</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={9}
                    max={16}
                    value={settings.fontSize || 13}
                    onChange={(e) => setSettings((s) => ({ ...s, fontSize: Number(e.target.value) }))}
                    className="flex-1 accent-blue-600"
                  />
                  <span className="w-10 text-center text-sm font-semibold text-slate-700">
                    {toBn(settings.fontSize || 13)}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ── ফুটার ───────────────────────────────────── */}
        <div className="border-t border-slate-200 bg-white px-6 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={resetAll}
            className="text-sm text-slate-500 hover:text-rose-600 font-medium"
          >
            ডিফল্টে ফিরুন
          </button>

          <div className="ml-auto flex items-center gap-2">
            {savedFlash && (
              <span className="text-sm font-medium text-emerald-600">সংরক্ষিত হয়েছে</span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={visible.length === 0}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold shadow hover:opacity-95 disabled:opacity-40"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeListSettingsModal;