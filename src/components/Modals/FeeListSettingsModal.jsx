import { useEffect, useMemo, useRef, useState } from 'react';
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
  MAX_COLUMNS_TWO_UP,
  maxColumnsFor,
  paperColumnCount,
  visibleFor,
  withVisible,
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
//      সব ঘর একসাথে এক প্রবাহে — আগে দলে দলে (শনাক্তকরণ, নাম ও পরিচয়…)
//      ভাগ করা ছিল, প্রতিটার আলাদা শিরোনাম সহ। ওতে লম্বা হয়ে যেত আর
//      খুঁজতেও বেশি চোখ বুলাতে হত। এখন কলামের তালিকার নিজের ক্রমেই
//      সবগুলো পাশাপাশি বসে, জায়গা থাকলে এক লাইনেই।
//
//   ২) কাগজের হেডার — ঠিক যেভাবে ছাপা হবে সেভাবেই দেখায়। ওখানেই:
//        • ঘরের নামে চাপ দিয়ে নতুন নাম লেখা
//        • ⠿ ধরে টেনে ক্রম বদলানো
//        • ↔ দিয়ে ঘরের জায়গা কমানো-বাড়ানো
//        • ✕ দিয়ে ঘরটা সরিয়ে ফেলা
//
//   ৩) স্বাক্ষরের নাম — কাগজের নিচের তিনটা ঘরে কী বসবে। ফাঁকা রাখলে
//      ডিফল্ট নামটাই যায়, ডান পাশেরটায় প্রতিষ্ঠানের মুহতামিমের নাম।
//
//   ৪) সাজানোর ক্রম — কোন ঘর ধরে, কোন দিকে। পাতা খোলার সময় এটাই
//      ফিল্টারের "সাজানো" বারে বসে যায়।
//
// ফর্মে যে ভাষা বাছা হয়েছে সেই ভাষার ঘরগুলোই কেবল দেখায়, আর সেটিংসও
// ভাষা ও তালিকার ধরন অনুযায়ী আলাদা সেভ হয়।
// =============================================================================

/**
 * সাজানোর বিকল্প — ফিল্টারের "সাজানো:" বারে যা আছে, হুবহু তাই।
 *
 * এখানে বসানো মানটাই পাতা খোলার সময় বারে উঠে আসে, তাই প্রতিবার হাতে
 * বেছে নিতে হয় না। বারটা থেকেই যাচ্ছে — এক বারের জন্য অন্যভাবে সাজাতে
 * চাইলে ওখান থেকেই বদলানো যাবে, শুধু সেটা সেভ হবে না।
 *
 * তালিকাটা এখানেই রাখা, feeListColumns থেকে আনা হয়নি — ঐ ফাইলে হাত না
 * দিয়েই যাতে এটা চলে।
 */
/** কাগজে কয় কলাম — উপরের ফিল্টারের বিকল্প */
const PAPER_COLUMN_OPTIONS = [
  { value: 1, label: '১ কলাম' },
  { value: 2, label: '২ কলাম' },
];

const SORT_FIELDS = [
  { key: 'AdmissionSerial', label: 'ভর্তি নং' },
  { key: 'UserCode', label: 'আইডি নং' },
];

const SORT_ORDERS = [
  { key: 'asc', label: 'ছোট → বড়', icon: 'M5 15l7-7 7 7' },
  { key: 'desc', label: 'বড় → ছোট', icon: 'M19 9l-7 7-7-7' },
];

/**
 * কাগজের নিচের তিনটা স্বাক্ষরের ঘর।
 *
 * placeholder টাই ডিফল্ট নাম — ফাঁকা রাখলে কাগজে ওটাই ছাপা হয়। তাই
 * সেটিংসে হাত না দিলে কাগজ আগের মতোই থাকে।
 */
const SIGNATURE_FIELDS = [
  { key: 'left', label: 'বাঁ পাশে', placeholder: 'হিসাব রক্ষক' },
  { key: 'middle', label: 'মাঝখানে', placeholder: 'পরীক্ষা নিয়ন্ত্রক' },
  { key: 'right', label: 'ডান পাশে', placeholder: 'মুহতামিম' },
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

const FeeListSettingsModal = ({
  open,
  onClose,
  listType = 1,
  language = 1,
  onSaved,
  // ⭐ জলছাপের ছবিটা — প্রিভিউতে দেখানোর জন্য
  watermarkLogo = '',
}) => {
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

  // এই ভাষার ঘরগুলো — একটাই তালিকা, কলামের নিজের ক্রমে
  const allColumns = useMemo(() => columnsForLanguage(language), [language]);

  // হেডার প্রিভিউর ঘরগুলো — কাগজে যেভাবে যাবে ঠিক সেভাবেই
  const previewColumns = useMemo(
    () => resolveColumns(settings, language),
    [settings, language]
  );

  /* কাগজে কয় কলাম — ১ বা ২। দুই কলামে প্রতিটা তালিকা অর্ধেক চওড়া পায়,
     তাই ঘরের সীমাও ছোট। */
  const paperColumns = paperColumnCount(settings.paperColumns);
  const columnLimit = maxColumnsFor(paperColumns);

  /* ⭐ দুই সাজের দুইটা আলাদা তালিকা — এক কলামের বাছাই দুই কলামে গিয়ে
        কাটা পড়ে না, তাই ফিরে এলে আগেরটাই পাওয়া যায়। */
  const visible = visibleFor(settings, language);
  const isOn = (key) => visible.includes(key);
  const isFull = visible.length >= columnLimit;

  const toggle = (key) => {
    setSettings((s) =>
      withVisible(s, toggleColumn(visibleFor(s, language), key, language, columnLimit))
    );
    setWidthKey((k) => (k === key ? null : k));
  };

  /* এক ↔ দুই কলাম বদল — শুধু সাজটাই বদলায়, কোনো তালিকা ছাঁটা হয় না */
  const setPaperColumns = (value) => {
    setSettings((s) => ({ ...s, paperColumns: paperColumnCount(value) }));
    setWidthKey(null);
  };

  const rename = (key, value) => {
    setSettings((s) => ({ ...s, labels: { ...(s.labels || {}), [key]: value } }));
  };

  const setSignature = (key, value) => {
    setSettings((s) => ({
      ...s,
      signatures: { ...(s.signatures || {}), [key]: value },
    }));
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

  /* ---- ঘরের কিনারা ধরে টেনে চওড়া বদলানো (এক্সেলের মতো)

     ঘরের ডান কিনারায় একটা সরু হাতল বসানো আছে। মাউস ওখানে গেলে কার্সার
     ↔ হয়ে যায়, আর চেপে ধরে টানলে ঘরটা মাউসের সাথে সাথে চওড়া-সরু হয়।

     হিসাবটা সোজা ভাগ নয়। ঘরের চওড়া বসে ওজনের অনুপাতে — w / (সবার যোগফল)।
     তাই একটা ঘরের ওজন বাড়ালে বাকিরা আপনাআপনি সরু হয়, আর সরল যোগ করলে
     ঘরটা মাউসের পিছিয়ে পড়ত। সেজন্য উল্টো দিক থেকে হিসাব: মাউস যেখানে
     আছে সেটাকেই চাওয়া ভগ্নাংশ f ধরে নিয়ে w = f·R / (1−f) — এখানে R
     বাকি ঘরগুলোর ওজনের যোগফল, যেটা টানার সময় বদলায় না। এতে কিনারাটা
     ঠিক মাউসের নিচেই থাকে।

     পয়েন্টার ইভেন্ট ব্যবহার করেছি, তাই মাউস-ট্র্যাকপ্যাড-টাচ সবেতেই চলে,
     আর setPointerCapture করায় মাউস টেবিলের বাইরে চলে গেলেও টানা থামে না। */
  const resizeRef = useRef(null);
  const [resizingKey, setResizingKey] = useState(null);

  const startResize = (col) => (e) => {
    // ঘর টেনে সাজানোর ড্র্যাগটা যেন শুরু না হয়ে যায়
    e.preventDefault();
    e.stopPropagation();

    const grip = e.currentTarget;
    const th = grip.closest('th');
    const table = grip.closest('table');
    if (!th || !table) return;

    const tableW = table.getBoundingClientRect().width;
    const startPx = th.getBoundingClientRect().width;
    const startWeight = col.weight || 100;
    const totalWeight = previewColumns.reduce((sum, c) => sum + (c.weight || 100), 0);

    resizeRef.current = {
      key: col.key,
      startX: e.clientX,
      startPx,
      startWeight,
      tableW,
      // বাকি ঘরগুলোর ওজন — টানার সময় এটা বদলায় না
      others: totalWeight - startWeight,
    };

    try {
      grip.setPointerCapture(e.pointerId);
    } catch {
      // পুরোনো ব্রাউজারে না পারলেও চলবে, শুধু বাইরে গেলে টানা ছুটে যাবে
    }
    setResizingKey(col.key);
  };

  const moveResize = (e) => {
    const r = resizeRef.current;
    if (!r) return;

    const want = r.startPx + (e.clientX - r.startX);

    if (r.others > 0 && r.tableW > 0) {
      const f = Math.min(Math.max(want / r.tableW, 0.02), 0.9);
      setWidth(r.key, (f * r.others) / (1 - f));
    } else {
      // একটাই ঘর — অনুপাতের হিসাব খাটে না, সরল ভাগই যথেষ্ট
      setWidth(r.key, (want / Math.max(r.startPx, 1)) * r.startWeight);
    }
  };

  const endResize = (e) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ধরা না থাকলে কিছু করার নেই
    }
    resizeRef.current = null;
    setResizingKey(null);
  };

  /* টানার সময় গোটা পর্দায় কার্সার ↔ থাকুক, আর লেখা যেন সিলেক্ট হয়ে
     নীল না হয়ে যায় */
  useEffect(() => {
    if (!resizingKey) return undefined;

    const body = document.body;
    const prevCursor = body.style.cursor;
    const prevSelect = body.style.userSelect;

    body.style.cursor = 'col-resize';
    body.style.userSelect = 'none';

    return () => {
      body.style.cursor = prevCursor;
      body.style.userSelect = prevSelect;
    };
  }, [resizingKey]);

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
      setSettings((s) =>
        withVisible(s, reorderColumns(visibleFor(s, language), dragKey, key))
      );
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

  // জলছাপের ঘনত্ব শতাংশে — বসানো না থাকলে আগের ৫%
  const watermarkOpacity = Math.min(
    Math.max(Number(settings.watermarkOpacity) || 5, 2),
    30
  );

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
              {toBn(visible.length)} / {toBn(columnLimit)}
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
              ধরে টেনে ক্রম বদলান, আর ঘরের ডান কিনারা ধরে টেনে চওড়া
              কমান-বাড়ান — এক্সেলের মতো। (কিনারায় দুইবার চাপলে আগের মাপে
              ফিরে যায়; স্লাইডারে নিখুঁত মাপ বসাতে
              <span className="mx-1 text-slate-400">↔</span>
              বোতামটা আছে।)
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

                  /* ---- কিনারার হাতল (এক্সেলের মতো) ----
                     ঘরের ডান কিনারা ঘেঁষে সরু একটা পট্টি। চওড়া ৭px —
                     চোখে পড়ে না, কিন্তু মাউস ধরতে কষ্ট হয় না। */
                  .fee-preview-table thead th { position: relative; }

                  .fee-col-grip {
                    position: absolute;
                    top: 0; right: 0; bottom: 0;
                    width: 7px;
                    cursor: col-resize;
                    touch-action: none;
                    z-index: 2;
                  }
                  /* ভেতরের দাগটা — মাউস কাছে গেলে বা টানার সময় দেখা যায় */
                  .fee-col-grip::after {
                    content: '';
                    position: absolute;
                    top: 3px; bottom: 3px; right: 2px;
                    width: 2px;
                    border-radius: 2px;
                    background: transparent;
                    transition: background .12s;
                  }
                  .fee-col-grip:hover::after,
                  .fee-col-grip.is-resizing::after { background: #4f46e5; }
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

                              {/* ডান কিনারার হাতল — ধরে টানলে ঘর চওড়া-সরু হয় */}
                              <span
                                className={`fee-col-grip ${
                                  resizingKey === col.key ? 'is-resizing' : ''
                                }`}
                                title="টেনে ঘরের চওড়া বদলান"
                                onPointerDown={startResize(col)}
                                onPointerMove={moveResize}
                                onPointerUp={endResize}
                                onPointerCancel={endResize}
                                onDoubleClick={() => clearWidth(col.key)}
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
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-bold text-slate-800">কী কী দেখাবে</h3>
              <span className="ml-auto text-xs text-slate-500">
                সর্বোচ্চ {toBn(MAX_COLUMNS)}টি ঘর
              </span>
            </div>

            {/* সব ঘর একসাথে — দল নেই, শিরোনাম নেই। জায়গা না কুলালে
                নিজে থেকেই পরের লাইনে নেমে যায়। */}
            <div className="flex flex-wrap gap-2">
              {allColumns.map((col) => {
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
          </section>

          {/* ৩. কাগজের সাজ — এক না দুই কলাম */}
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-slate-800 mb-1">কাগজের সাজ</h3>
            <p className="text-xs text-slate-500 mb-3">
              দুই কলামে কাগজের দুই পাশে দুইটা তালিকা পাশাপাশি বসে — বাঁ
              দিকটা ভরে তারপর ডান দিক। একই সংখ্যক শিক্ষার্থীতে কাগজ প্রায়
              অর্ধেক লাগে। তবে প্রতিটা তালিকা অর্ধেক চওড়া পায়, তাই ঘরের
              সীমাও কমে — {toBn(MAX_COLUMNS)} এর বদলে {toBn(MAX_COLUMNS_TWO_UP)}।
              দুই সাজের ঘর আলাদা করে মনে রাখা হয়, তাই এক কলামে ফিরলে
              ওখানে যা বেছে রেখেছিলেন সেটাই ফিরে আসে।
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
                {PAPER_COLUMN_OPTIONS.map((opt) => {
                  const on = paperColumns === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPaperColumns(opt.value)}
                      className={`px-3.5 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition ${
                        on ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {/* ছোট ছবিতে বোঝানো — কাগজটা কেমন দেখাবে */}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth="2" />
                        {opt.value === 2 && (
                          <path strokeLinecap="round" strokeWidth="2" d="M12 4v16" />
                        )}
                      </svg>
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <span className="text-xs text-slate-500">
                এখন সর্বোচ্চ <b className="text-slate-700">{toBn(columnLimit)}</b> টা ঘর বসবে
                {isFull && <span className="text-amber-600"> — সীমায় পৌঁছে গেছে</span>}
              </span>
            </div>
          </section>

          {/* ৪. কাগজের সেটিংস */}
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-slate-800 mb-1">কাগজের সেটিংস</h3>
            <p className="text-xs text-slate-500 mb-3">
              প্রতিষ্ঠানের লোগো বসে কাগজের মাথায়, নামের উপরে। জলছাপেও
              একই লোগো বসে, তবে পাতার মাঝখানে — হালকা হয়ে লেখার পেছনে।
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

              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
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

            {/* ── জলছাপের ঘনত্ব ও প্রিভিউ ─────────────────────
                জলছাপ বন্ধ থাকলে এই অংশটা দেখানোর মানে নেই। */}
            {settings.showWatermark !== false && (
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[13px] font-semibold text-slate-700 whitespace-nowrap">
                    জলছাপের ঘনত্ব
                  </span>

                  <input
                    type="range"
                    min={2}
                    max={30}
                    step={1}
                    value={watermarkOpacity}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, watermarkOpacity: Number(e.target.value) }))
                    }
                    className="flex-1 min-w-[160px] accent-blue-600"
                  />

                  <span className="w-14 text-center text-sm font-semibold text-slate-700">
                    {toBn(watermarkOpacity)}%
                  </span>

                  <button
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, watermarkOpacity: 5 }))}
                    className="text-sm text-slate-500 hover:text-blue-700 font-medium whitespace-nowrap"
                  >
                    স্বয়ংক্রিয়
                  </button>
                </div>

                {/* কাগজে কেমন দেখাবে — ছোট করে।
                    লেখাগুলো উপরে, লোগোটা পেছনে — ঠিক যেভাবে ছাপা হয়। */}
                <div className="mt-3 relative h-28 rounded-md border border-slate-200 bg-white overflow-hidden">
                  {watermarkLogo ? (
                    <img
                      src={watermarkLogo}
                      alt=""
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[80%] max-w-[55%] object-contain pointer-events-none"
                      style={{ opacity: watermarkOpacity / 100 }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[11px] text-slate-400">
                        প্রতিষ্ঠানের লোগো পাওয়া যায়নি
                      </span>
                    </div>
                  )}

                  <div className="relative px-3 py-2 text-[10px] leading-[1.9] text-slate-600">
                    <div className="font-bold text-slate-800 text-[11px] text-center mb-1">
                      নমুনা — কাগজে এভাবেই দেখাবে
                    </div>
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="flex gap-3 border-b border-slate-100">
                        <span className="w-6 text-center">{toBn(n)}</span>
                        <span className="flex-1">শিক্ষার্থীর নাম</span>
                        <span className="w-14 text-center">১০০</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ৩. স্বাক্ষরের নাম */}
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-slate-800 mb-1">স্বাক্ষরের নাম</h3>
            <p className="text-xs text-slate-500 mb-3">
              কাগজের নিচে তিনটা স্বাক্ষরের ঘরে যে নাম বসবে। ফাঁকা রাখলে
              ঘরের ভেতরে ধূসর করে লেখা নামটাই ছাপা হবে।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SIGNATURE_FIELDS.map((f) => (
                <div key={f.key} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <label className="block text-[11px] text-slate-500 mb-1">{f.label}</label>
                  <input
                    type="text"
                    value={settings.signatures?.[f.key] ?? ''}
                    placeholder={f.placeholder}
                    onChange={(e) => setSignature(f.key, e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-center outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              ))}
            </div>

            {/* নিচে ঠিক যেভাবে বসবে — এক নজরে দেখে নেওয়ার জন্য */}
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/60 px-4 pt-8 pb-3">
              <div className="flex justify-between text-[13px] text-slate-700">
                {SIGNATURE_FIELDS.map((f) => (
                  <div key={f.key} className="text-center">
                    <div className="border-t border-slate-800 pt-1 px-6">
                      {settings.signatures?.[f.key]?.trim() || f.placeholder}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ৫. সাজানোর ক্রম */}
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-slate-800 mb-1">সাজানোর ক্রম</h3>
            <p className="text-xs text-slate-500 mb-3">
              তালিকাটা কোন ঘর ধরে, কোন দিকে সাজানো থাকবে। এটাই প্রতিবার
              পাতা খোলার সময় বসে যাবে, তাই উপরের "সাজানো" বারে আর হাতে
              বেছে নিতে হবে না।
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap gap-2">
                {SORT_FIELDS.map((opt) => {
                  const on = (settings.sortBy || 'AdmissionSerial') === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, sortBy: opt.key }))}
                      className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        on
                          ? 'bg-sky-600 border-sky-600 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-1 ml-auto rounded-lg border border-slate-200 bg-white p-1">
                {SORT_ORDERS.map((opt) => {
                  const on = (settings.sortOrder || 'asc') === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, sortOrder: opt.key }))}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition ${
                        on ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={opt.icon} />
                      </svg>
                      {opt.label}
                    </button>
                  );
                })}
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
