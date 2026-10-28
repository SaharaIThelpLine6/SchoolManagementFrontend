import { useEffect, useMemo, useRef, useState } from 'react';

import {
  BLANK_ROWS_MAX,
  FONT_MAX,
  ROW_HEIGHT_MAX,
  FONT_MIN,
  NUMBER_SHEET_FIELDS,
  ORIENTATIONS,
  PAPERS,
  SIGN_DEFAULTS,
  SORT_KEYS,
  TITLE_DEFAULT,
  WATERMARK_MAX,
  WATERMARK_MIN,
  WIDTH_MAX,
  WIDTH_MIN,
  clampBlankRows,
  clampFont,
  clampRowHeight,
  clampWatermark,
  clampWidth,
  columnCount,
  defaultNumberSheetSettings,
  loadNumberSheetSettings,
  maxFieldsFor,
  orientationValue,
  paperById,
  renameField,
  reorderFields,
  resolveFields,
  rowHeightMm,
  saveNumberSheetSettings,
  setFieldWidth,
  sortKeyValue,
  sortOrderValue,
  toBn,
  toLogoSrc,
  toggleField,
  visibleFields,
} from '../../Data/numberSheetColumns';
import { useGetInstitutionInfoQuery } from '../../features/settings/settingsQuerySlice';

// =============================================================================
// নম্বর পত্র ও স্বাক্ষরপত্রের সেটিংস
//
// ফি তালিকার মডালের (FeeListSettingsModal) হুবহু একই ধাঁচে — দুই রিপোর্টে
// একই নিয়ম, তাই নতুন করে কিছু শিখতে হয় না:
//
//   ১) কাগজের হেডার — ঠিক যেভাবে ছাপা হবে সেভাবেই দেখায়, উপরে আটকানো।
//      ওখানেই নাম বদলানো, টেনে ক্রম বদলানো আর কিনারা ধরে চওড়া কমানো-বাড়ানো।
//   ২) কী কী দেখাবে — টিকের পিল, সীমার মধ্যে।
//   ৩) কাগজ ও সাজ — A4/A5, লম্বালম্বি/আড়াআড়ি, এক/দুই কলাম।
//   ৪) সাজানোর ক্রম — ভর্তি নং না আইডি নং।
//   ৫) কাগজের সেটিংস — মাথার অংশগুলো, লেখার আকার, জলছাপ।
//   ৬) কাগজের শিরোনাম — উপরের পট্টিতে কী বসবে।
//   ৭) স্বাক্ষরের নাম — নিচের দুইটা ঘরে কী বসবে।
//
// ⭐ দুইটা রিপোর্ট এক হয়েছে
//
//    "৩. নম্বর পত্র" আর "৫. স্বাক্ষরপত্র ও নম্বরসীট" এখন একটাই কাগজ।
//    "স্বাক্ষর", "মাসিক নম্বর" আর "মোট নম্বর" ঘরগুলো চালু করলেই কাগজটা
//    স্বাক্ষরপত্র হয়ে যায়। উপরে দুইটা তৈরি সাজ রাখা আছে, এক চাপেই বসে।
//
// src/components/Modals/NumberSheetSettingsModal.jsx
// =============================================================================

/** তৈরি সাজ — এক চাপে ঘরগুলো বসিয়ে দেয় */
const PRESETS = [
  {
    id: 'number',
    title: 'নম্বর পত্র',
    note: 'ক্রম, ভর্তি নং, আইডি, নাম, প্রাপ্ত নম্বর',
    visible: ['SL', 'AdmissionSerial', 'UserCode', 'UserName', 'Mark'],
  },
  {
    id: 'signature',
    title: 'স্বাক্ষরপত্র',
    note: 'সাথে স্বাক্ষর, মাসিক ও মোট নম্বরের ঘর',
    visible: [
      'SL', 'AdmissionSerial', 'UserCode', 'UserName',
      'Signature', 'Mark', 'MonthlyMark', 'TotalMark',
    ],
  },
];

const sameList = (a, b) =>
  Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]);

const CheckBox = ({ checked }) => (
  <span
    className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
      checked ? 'border-violet-600 bg-violet-600' : 'border-slate-300 bg-white'
    }`}
  >
    {checked && (
      <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
      </svg>
    )}
  </span>
);

/** বোতামের সারি — বাছাই করাটা বেগুনি */
const Pills = ({ options, value, onPick }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((opt) => {
      const on = String(opt.id) === String(value);

      return (
        <button
          key={opt.id}
          type="button"
          onClick={() => onPick(opt.id)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
            on
              ? 'bg-violet-600 border-violet-600 text-white'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

const NumberSheetSettingsModal = ({
  open,
  onClose,
  language = 1,
  onSaved,
  // জলছাপের নমুনায় বসে — না পেলে নমুনাটা ছাড়াই চলে
  watermarkLogo = '',
}) => {
  const [settings, setSettings] = useState(defaultNumberSheetSettings);
  const [previewOpen, setPreviewOpen] = useState(true);

  const [dragKey, setDragKey] = useState(null);
  const [overKey, setOverKey] = useState(null);
  const [grabbed, setGrabbed] = useState(null);
  const [widthKey, setWidthKey] = useState(null);

  /* ⭐ জলছাপের ছবিটা সত্যিই লোড হলো কি না।

     ঠিকানা আছে অথচ ছবিটা নেই — এই অবস্থাটা আগে একদম নীরব ছিল। <img>
     ভাঙলে ব্রাউজার কিছুই আঁকে না (alt ফাঁকা), তাই নমুনার ঘরটা ফাঁকা
     পড়ে থাকত আর বোঝার উপায়ই ছিল না ছবিটা নেই, নাকি ঘনত্ব এত কম যে
     চোখে পড়ছে না। এখন ভাঙলে নিচে লেখা ওঠে, সাথে ঠিকানাটাও — তাই
     কোথায় আটকাল সেটা এক নজরেই বোঝা যায়। */
  const [stampFailed, setStampFailed] = useState(false);

  /* ⭐ প্রতিষ্ঠানের লোগোটা মডাল নিজেই আনে।

     কাগজে জলছাপে যে লোগোটা বসে সেটা প্রতিষ্ঠানের নিজের লোগো — রুটের
     header এ varbinary হয়ে আসে, তাই ওটা base64 ছবি হয়ে যায় আর সবসময়
     দেখা যায়।

     কিন্তু প্রপে আসা ছবিটা (watermarkLogo) আসে document_settings এর
     আলাদা ফাইল থেকে, যেটা অনেক প্রতিষ্ঠানে বসানোই থাকে না বা পথটা
     মেলে না। ফলে নমুনায় এক ছবি আর কাগজে আরেক — বা নমুনায় কিছুই না।

     তাই এখানেও প্রতিষ্ঠানের লোগোটাই আগে, কাগজ যে ক্রমে খোঁজে ঠিক সেই
     ক্রমে। এতে নমুনায় যা দেখবেন কাগজেও তাই বসবে। */
  const { data: institutionInfo } = useGetInstitutionInfoQuery();

  // খোলার প্রতিবারই সেভ করাটা তুলে আনি — আগের খোলার আধখেঁচড়া বদল যেন
  // বসে না থাকে
  useEffect(() => {
    if (open) {
      setSettings(loadNumberSheetSettings(language));
      setDragKey(null);
      setOverKey(null);
      setGrabbed(null);
      setWidthKey(null);
    }
  }, [open, language]);

  // হেডার প্রিভিউর ঘরগুলো — কাগজে যেভাবে যাবে ঠিক সেভাবেই
  const previewFields = useMemo(() => resolveFields(settings), [settings]);

  const columns = columnCount(settings.columns);
  const fieldLimit = maxFieldsFor(columns);
  const visible = visibleFields(settings).map((f) => f.key);
  const isFull = visible.length >= fieldLimit;

  const set = (patch) => setSettings((s) => ({ ...s, ...patch }));

  const toggle = (key) => {
    setSettings((s) => ({ ...s, visible: toggleField(s.visible, key, maxFieldsFor(s.columns)) }));
    setWidthKey((k) => (k === key ? null : k));
  };

  const rename = (key, value) => setSettings((s) => renameField(s, key, value));
  const setWidth = (key, value) => setSettings((s) => setFieldWidth(s, key, value));
  const clearWidth = (key) => setSettings((s) => setFieldWidth(s, key, null));

  /* এক ↔ দুই কলাম বদল।

     ⭐ এখানে কোনো ঘর ছাঁটা হয় না — তালিকাটা যেমন আছে তেমনই থাকে, শুধু
     দুই কলামে উপরের কয়টা বসে (visibleFields নিজেই সীমা মানে)। তাই এক
     কলামে ফিরলে আগের ঘরগুলোও ফিরে আসে, হারায় না। */
  const setColumns = (value) => {
    set({ columns: columnCount(value) });
    setWidthKey(null);
  };

  /* ---- ঘরের কিনারা ধরে টেনে চওড়া বদলানো (এক্সেলের মতো)

     হিসাবটা সোজা ভাগ নয়। ঘরের চওড়া বসে ওজনের অনুপাতে — w / (সবার যোগফল)।
     তাই একটা ঘরের ওজন বাড়ালে বাকিরা আপনাআপনি সরু হয়, আর সরল যোগ করলে
     ঘরটা মাউসের পিছিয়ে পড়ত। সেজন্য উল্টো দিক থেকে হিসাব: মাউস যেখানে
     আছে সেটাকেই চাওয়া ভগ্নাংশ f ধরে নিয়ে w = f·R / (1−f) — এখানে R
     বাকি ঘরগুলোর ওজনের যোগফল, যেটা টানার সময় বদলায় না।

     পয়েন্টার ইভেন্ট, তাই মাউস-ট্র্যাকপ্যাড-টাচ সবেতেই চলে; আর
     setPointerCapture করায় মাউস টেবিলের বাইরে গেলেও টানা থামে না। */
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
    const startWeight = col.width || 20;
    const totalWeight = previewFields.reduce((sum, c) => sum + (c.width || 20), 0);

    resizeRef.current = {
      key: col.key,
      startX: e.clientX,
      startPx,
      startWeight,
      tableW,
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
      setSettings((s) => ({ ...s, visible: reorderFields(s.visible, dragKey, key) }));
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

  const handleReset = () => {
    setSettings(defaultNumberSheetSettings());
    setWidthKey(null);
  };

  const handleSave = () => {
    saveNumberSheetSettings(language, settings);
    onSaved?.(settings);
    onClose?.();
  };

  if (!open) return null;

  const langName = Number(language) === 2 ? 'আরবি' : 'বাংলা';
  const widthCol = widthKey ? previewFields.find((c) => c.key === widthKey) : null;
  const font = clampFont(settings.fontSize);
  const opacity = clampWatermark(settings.watermarkOpacity);

  /* ⭐ লোগোর ঠিকানাটা বের করে নিই।

     আগে প্রপে আসা মানটা সরাসরি <img src> এ বসানো হত। কিন্তু ওটা কোথাও
     শুধু ফাইলের নাম (logo_12.png) — তখন ব্রাউজার চলতি পাতার ঠিকানা ধরে
     খুঁজত আর নমুনায় কিছুই দেখা যেত না। কাগজ যে নিয়মে লোগো বের করে,
     এখানেও হুবহু সেটাই। */
  const stampSrc =
    toLogoSrc(institutionInfo?.Logo) ||
    toLogoSrc(institutionInfo?.InstitutionLogo) ||
    toLogoSrc(watermarkLogo);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 print:hidden">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* ── রঙিন হেডার ─────────────────────────────── */}
        <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-6 py-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <div className="min-w-0">
            <h2 className="text-white font-bold text-lg leading-tight">
              নম্বর পত্র ও স্বাক্ষরপত্র — সেটিংস
            </h2>
            <p className="text-white/80 text-xs mt-0.5 truncate">
              কাগজ, কলাম, ঘর ও সাজানোর ক্রম
            </p>
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
              {toBn(visible.length)} / {toBn(fieldLimit)}
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
            সামনে দেখা যায়। */}
        <div className="shrink-0 bg-white border-b border-violet-100 px-6 pt-4 pb-3 shadow-[0_3px_10px_-4px_rgba(15,23,42,0.18)]">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="h-4 w-1 rounded bg-violet-500" />
            <h3 className="font-bold text-slate-800">কাগজের হেডার</h3>
            <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-600">
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

          <div className={previewOpen ? 'max-h-[40vh] overflow-y-auto pr-0.5' : 'hidden'}>
            <p className="text-xs text-slate-500 mb-3">
              কাগজে ঠিক এভাবেই ছাপা হবে। নামের ঘরে চাপ দিয়ে নতুন নাম লিখুন,
              <span className="mx-1 text-slate-400">⠿</span>
              ধরে টেনে ক্রম বদলান, আর ঘরের ডান কিনারা ধরে টেনে চওড়া
              কমান-বাড়ান — এক্সেলের মতো। (কিনারায় দুইবার চাপলে আগের মাপে
              ফিরে যায়; স্লাইডারে নিখুঁত মাপ বসাতে
              <span className="mx-1 text-slate-400">↔</span>
              বোতামটা আছে।)
            </p>

            {previewFields.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                নিচ থেকে অন্তত একটা ঘর বেছে নিন
              </p>
            ) : (
              <>
                {/* প্রিভিউর টেবিলও কাগজের মতোই — বর্ডার ঘরের ভেতরে, তাই
                    ডান পাশের ঘরটা কেটে যায় না */}
                <style>{`
                  .ns-preview-table {
                    width: 100%; max-width: 100%;
                    table-layout: fixed;
                    border-collapse: separate; border-spacing: 0;
                  }
                  .ns-preview-table th, .ns-preview-table td {
                    border-right: 1px solid #cbd5e1;
                    border-bottom: 1px solid #cbd5e1;
                    overflow-wrap: anywhere; word-break: break-word;
                  }
                  .ns-preview-table th:first-child,
                  .ns-preview-table td:first-child { border-left: 1px solid #cbd5e1; }
                  .ns-preview-table thead th { border-top: 1px solid #cbd5e1; position: relative; }

                  /* ---- কিনারার হাতল (এক্সেলের মতো) ----
                     ঘরের ডান কিনারা ঘেঁষে সরু একটা পট্টি। চওড়া ৭px —
                     চোখে পড়ে না, কিন্তু মাউস ধরতে কষ্ট হয় না। */
                  .ns-col-grip {
                    position: absolute;
                    top: 0; right: 0; bottom: 0;
                    width: 7px;
                    cursor: col-resize;
                    touch-action: none;
                    z-index: 2;
                  }
                  .ns-col-grip::after {
                    content: '';
                    position: absolute;
                    top: 3px; bottom: 3px; right: 2px;
                    width: 2px;
                    border-radius: 2px;
                    background: transparent;
                    transition: background .12s;
                  }
                  .ns-col-grip:hover::after,
                  .ns-col-grip.is-resizing::after { background: #7c3aed; }
                `}</style>

                <div className="rounded-lg overflow-hidden">
                  <table className="ns-preview-table" style={{ fontSize: `${font + 3}px` }}>
                    <colgroup>
                      {previewFields.map((col) => {
                        const total = previewFields.reduce((s, c) => s + (c.width || 20), 0);
                        return (
                          <col key={col.key} style={{ width: `${((col.width || 20) / total) * 100}%` }} />
                        );
                      })}
                    </colgroup>

                    <thead>
                      <tr className="bg-violet-50">
                        {previewFields.map((col) => {
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
                                widthKey === col.key ? 'ring-2 ring-inset ring-violet-400' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span
                                  onMouseDown={() => setGrabbed(col.key)}
                                  onMouseUp={() => setGrabbed(null)}
                                  title="ধরে টেনে সরান"
                                  className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-violet-600 select-none leading-none px-0.5"
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
                                        ? 'bg-violet-600 text-white'
                                        : 'text-slate-400 hover:bg-violet-100 hover:text-violet-600'
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
                                className="w-full bg-transparent text-center font-bold text-slate-900 placeholder:text-slate-900 placeholder:font-bold rounded px-1 py-0.5 outline-none cursor-text hover:bg-white/70 focus:bg-white focus:ring-2 focus:ring-violet-300"
                              />

                              {/* ডান কিনারার হাতল — ধরে টানলে ঘর চওড়া-সরু হয় */}
                              <span
                                className={`ns-col-grip ${resizingKey === col.key ? 'is-resizing' : ''}`}
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
                        {previewFields.map((col) => (
                          <td
                            key={col.key}
                            className="px-2 py-1.5"
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
                  <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50/60 px-4 py-3 flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                      {widthCol.label} — জায়গা
                    </span>

                    <input
                      type="range"
                      min={WIDTH_MIN}
                      max={WIDTH_MAX}
                      step={1}
                      value={widthCol.width || 20}
                      onChange={(e) => setWidth(widthCol.key, e.target.value)}
                      className="flex-1 min-w-[160px] accent-violet-600"
                    />

                    <input
                      type="number"
                      min={WIDTH_MIN}
                      max={WIDTH_MAX}
                      value={clampWidth(settings.widths?.[widthCol.key]) ?? ''}
                      placeholder={String(widthCol.width || 20)}
                      onChange={(e) => setWidth(widthCol.key, e.target.value)}
                      className="w-20 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-center outline-none focus:border-violet-400"
                    />

                    <button
                      type="button"
                      onClick={() => clearWidth(widthCol.key)}
                      className="text-sm text-slate-500 hover:text-violet-700 font-medium whitespace-nowrap"
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
          {/* ১. তৈরি সাজ */}
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-slate-800 mb-1">তৈরি সাজ</h3>
            <p className="text-xs text-slate-500 mb-3">
              আগের "৩. নম্বর পত্র" আর "৫. স্বাক্ষরপত্র ও নম্বরসীট" এখন একটাই
              কাগজ। এক চাপে ঘরগুলো বসিয়ে নিন, তারপর দরকারমতো বদলান।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESETS.map((p) => {
                const on = sameList(settings.visible, p.visible);

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => set({ visible: [...p.visible] })}
                    className={`rounded-lg border px-3 py-2.5 text-left transition ${
                      on
                        ? 'border-violet-500 ring-2 ring-violet-200 bg-violet-50/40'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className={`block text-sm font-semibold ${on ? 'text-violet-700' : 'text-slate-700'}`}>
                      {p.title}
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">{p.note}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ২. কী কী দেখাবে — টিকের পিল */}
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-bold text-slate-800">কী কী দেখাবে</h3>
              <span className={`ml-auto text-xs font-semibold ${isFull ? 'text-amber-600' : 'text-slate-500'}`}>
                সর্বোচ্চ {toBn(fieldLimit)}টি ঘর
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {NUMBER_SHEET_FIELDS.map((f) => {
                const on = visible.includes(f.key);
                const locked = !on && isFull;

                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => toggle(f.key)}
                    disabled={locked}
                    title={
                      locked
                        ? 'সীমায় পৌঁছে গেছে — আগে একটা ঘর বন্ধ করুন'
                        : f.blank
                        ? 'হাতে লেখার জন্য ফাঁকা ঘর'
                        : undefined
                    }
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                      on
                        ? 'border-violet-300 bg-violet-50 text-violet-800'
                        : locked
                        ? 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-violet-300 hover:bg-violet-50/50'
                    }`}
                  >
                    <CheckBox checked={on} />
                    {f.label}
                    {/* হাতে লেখার ঘরগুলো একটা ছোট কলমের চিহ্নে চেনা যায় —
                        আগে প্রতিটা সারিতে "হাতে লেখার ঘর" লেখাটা বসত,
                        তাতে একই কথা চারবার পড়ত আর চোখে লাগত */}
                    {f.blank && (
                      <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="mt-2.5 text-[11px] text-slate-400 leading-relaxed">
              <svg className="inline w-3 h-3 -mt-0.5 mr-0.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              চিহ্ন দেওয়া ঘরগুলো কাগজে ফাঁকা যায় — হাতে লেখার জন্য।
            </p>
          </section>

          {/* ৩. কাগজ ও সাজ */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 mb-1">কাগজের সাজ</h3>
              <p className="text-xs text-slate-500 mb-3">
                দুই কলামে কাগজের দুই পাশে দুইটা তালিকা পাশাপাশি বসে — বাঁ দিকটা
                ভরে তারপর ডান দিক। একই সংখ্যক শিক্ষার্থীতে কাগজ প্রায় অর্ধেক
                লাগে। তবে প্রতিটা তালিকা অর্ধেক চওড়া পায়, তাই ঘরের সীমাও কমে —
                ৮ এর বদলে ৪। প্রতি পাতায় কয়টা সারি ধরবে সেটা নিজে থেকেই হিসাব
                হয়, তাই কাগজ ছোট-বড় করলে সারিও কমে-বাড়ে।
              </p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div>
                  <span className="block text-[11px] text-slate-500 mb-1.5">কাগজের মাপ</span>
                  <Pills
                    options={PAPERS.map((p) => ({ id: p.id, label: p.label }))}
                    value={paperById(settings.paper).id}
                    onPick={(id) => set({ paper: paperById(id).id })}
                  />
                </div>

                <div>
                  <span className="block text-[11px] text-slate-500 mb-1.5">দিক</span>
                  <Pills
                    options={ORIENTATIONS}
                    value={orientationValue(settings.orientation)}
                    onPick={(id) => set({ orientation: orientationValue(id) })}
                  />
                </div>

                <div>
                  <span className="block text-[11px] text-slate-500 mb-1.5">কলাম</span>
                  <div className="flex items-center gap-3">
                    <Pills
                      options={[
                        { id: 1, label: '১ কলাম' },
                        { id: 2, label: '২ কলাম' },
                      ]}
                      value={columns}
                      onPick={setColumns}
                    />

                    <span className="text-xs text-slate-500">
                      এখন সর্বোচ্চ <b className="text-slate-700">{toBn(fieldLimit)}</b> টা ঘর বসবে
                      {isFull && <span className="text-amber-600"> — সীমায় পৌঁছে গেছে</span>}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ৪. সাজানোর ক্রম */}
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-slate-800 mb-1">সাজানোর ক্রম</h3>
            <p className="text-xs text-slate-500 mb-3">
              মানটা সংখ্যায় এনে মেলানো হয়, তাই '০০৭' আসে '১০' এর আগে। যার
              ঘরটা ফাঁকা সে সবার শেষে যায়, ক্রম উল্টালেও।
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div>
                <span className="block text-[11px] text-slate-500 mb-1.5">কী ধরে</span>
                <Pills
                  options={SORT_KEYS.map((s) => ({ id: s.key, label: s.label }))}
                  value={sortKeyValue(settings.sortBy)}
                  onPick={(id) => set({ sortBy: sortKeyValue(id) })}
                />
              </div>

              <div>
                <span className="block text-[11px] text-slate-500 mb-1.5">ক্রম</span>
                <Pills
                  options={[
                    { id: 'asc', label: 'ছোট → বড়' },
                    { id: 'desc', label: 'বড় → ছোট' },
                  ]}
                  value={sortOrderValue(settings.sortOrder)}
                  onPick={(id) => set({ sortOrder: sortOrderValue(id) })}
                />
              </div>
            </div>
          </section>

          {/* ৫. কাগজের শিরোনাম */}
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-slate-800 mb-1">কাগজের শিরোনাম</h3>
            <p className="text-xs text-slate-500 mb-3">
              প্রতিষ্ঠানের নামের নিচে গোল পট্টিতে যে লেখাটা বসবে। ⭐ আগে
              ওখানে পরীক্ষার নাম ও শিক্ষাবর্ষ বসত — ওগুলো এখন নিচের
              শ্রেণি/জামাতের সারিতে নেমে গেছে, কারণ পট্টির আসল কাজ কাগজটা
              কী তা বলা। ফাঁকা রাখলে "{TITLE_DEFAULT}" ছাপা হবে।
            </p>

            <input
              type="text"
              value={settings.title ?? ''}
              placeholder={TITLE_DEFAULT}
              onChange={(e) => set({ title: e.target.value })}
              className="w-full max-w-md rounded-md border border-slate-200 px-3 py-2 text-sm text-center font-semibold text-slate-800 outline-none focus:border-violet-400"
            />
          </section>

          {/* ৬. কাগজের সেটিংস */}
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-slate-800 mb-1">কাগজের সেটিংস</h3>
            <p className="text-xs text-slate-500 mb-3">
              যেগুলো বন্ধ করবেন সেই জায়গাটুকু ছকের সারিতে যোগ হয়ে যায় — মানে
              প্রতি পাতায় কয়েকজন বেশি ধরবে। জলছাপেও প্রতিষ্ঠানের লোগোই বসে,
              তবে পাতার মাঝখানে — হালকা হয়ে লেখার পেছনে।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { key: 'showHeader', label: 'প্রতিষ্ঠানের শিরোনাম' },
                { key: 'showLogo', label: 'প্রতিষ্ঠানের লোগো', hint: 'মাথায়' },
                { key: 'showWatermark', label: 'জলছাপ', hint: 'পেছনে', offByDefault: true },
                { key: 'showExamBand', label: 'পরীক্ষার পট্টি' },
                { key: 'showMeta', label: 'শ্রেণি / কিতাব / মোট' },
                { key: 'showExaminer', label: 'পরীক্ষক ও তারিখ' },
                { key: 'showFooterSign', label: 'নিচে স্বাক্ষরের দাগ' },
              ].map((item) => {
                const on = item.offByDefault
                  ? settings[item.key] === true
                  : settings[item.key] !== false;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => set({ [item.key]: !on })}
                    className="inline-flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 hover:border-violet-300 text-left"
                  >
                    <CheckBox checked={on} />
                    <span className="text-sm text-slate-700">{item.label}</span>
                    {item.hint && (
                      <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                        {item.hint}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* ---- লেখার আকার ---- */}
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                <label className="block text-[11px] text-slate-500 mb-1">লেখার আকার</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={FONT_MIN}
                    max={FONT_MAX}
                    step={0.5}
                    value={font}
                    onChange={(e) => set({ fontSize: clampFont(e.target.value) })}
                    className="flex-1 accent-violet-600"
                  />
                  <span className="w-10 text-center text-sm font-semibold text-slate-700">
                    {toBn(font)}
                  </span>
                </div>
              </div>
            </div>

            {/* ── জলছাপের ঘনত্ব ও নমুনা ───────────────────
                জলছাপ বন্ধ থাকলে এই অংশটা দেখানোর মানে নেই। */}
            {settings.showWatermark === true && (
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[13px] font-semibold text-slate-700 whitespace-nowrap">
                    জলছাপের ঘনত্ব
                  </span>

                  <input
                    type="range"
                    min={WATERMARK_MIN}
                    max={WATERMARK_MAX}
                    step={1}
                    value={opacity}
                    onChange={(e) => set({ watermarkOpacity: clampWatermark(e.target.value) })}
                    className="flex-1 min-w-[160px] accent-violet-600"
                  />

                  <span className="w-12 text-center text-sm font-semibold text-slate-700">
                    {toBn(opacity)}%
                  </span>

                  <button
                    type="button"
                    onClick={() => set({ watermarkOpacity: clampWatermark(undefined) })}
                    className="text-sm text-slate-500 hover:text-violet-700 font-medium whitespace-nowrap"
                  >
                    স্বয়ংক্রিয়
                  </button>
                </div>

                {/* নমুনা — কাগজে লোগোটা কতটা গাঢ় দেখাবে */}
                <div className="mt-3 relative overflow-hidden rounded-md border border-slate-200 bg-white px-3 py-2 min-h-[86px]">
                  <p className="text-center text-[11px] font-semibold text-slate-500 mb-1">
                    নমুনা — কাগজে এভাবেই দেখাবে
                  </p>

                  {stampSrc && !stampFailed && (
                    <img
                      // ঠিকানা বদলালে React যেন নতুন করে চেষ্টা করে
                      key={stampSrc}
                      src={stampSrc}
                      alt=""
                      aria-hidden="true"
                      onLoad={() => setStampFailed(false)}
                      onError={() => setStampFailed(true)}
                      className="pointer-events-none absolute left-1/2 top-1/2 w-24 -translate-x-1/2 -translate-y-1/2"
                      style={{ opacity: opacity / 100 }}
                    />
                  )}

                  <div className="relative text-[11px] text-slate-600">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex justify-between border-b border-slate-100 py-0.5">
                        <span>{toBn(i)}</span>
                        <span>শিক্ষার্থীর নাম</span>
                        <span>…</span>
                      </div>
                    ))}
                  </div>

                  {/* ⭐ তিনটা অবস্থা, তিন রকম কথা — ফাঁকা ঘর দেখে আর
                      আন্দাজ করতে হয় না */}
                  {!stampSrc && (
                    <p className="relative mt-1.5 text-center text-[11px] text-amber-600">
                      প্রতিষ্ঠানের লোগো পাওয়া যায়নি, তাই নমুনায় জলছাপ দেখা যাচ্ছে না।
                      প্রতিষ্ঠানের সেটিংসে লোগোটা বসালে কাগজেও বসবে।
                    </p>
                  )}

                  {stampSrc && stampFailed && (
                    <p className="relative mt-1.5 text-center text-[11px] text-rose-600 break-all">
                      ছবিটা খুঁজে পাওয়া যায়নি — ঠিকানা: {stampSrc}
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* ৭. স্বাক্ষরের নাম — দুইটা */}
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-slate-800 mb-1">স্বাক্ষরের নাম</h3>
            <p className="text-xs text-slate-500 mb-3">
              কাগজের নিচে দুইটা স্বাক্ষরের ঘরে যে নাম বসবে। ফাঁকা রাখলে ঘরের
              ভেতরে ধূসর করে লেখা নামটাই ছাপা হবে।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'signLeft', side: 'বাঁ পাশে' },
                { key: 'signRight', side: 'ডান পাশে' },
              ].map((item) => (
                <div key={item.key} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <label className="block text-[11px] text-slate-500 mb-1">{item.side}</label>
                  <input
                    type="text"
                    value={settings[item.key] ?? ''}
                    placeholder={SIGN_DEFAULTS[item.key]}
                    onChange={(e) => set({ [item.key]: e.target.value })}
                    className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm text-center text-slate-800 outline-none focus:border-violet-400"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* ৮. সারির উচ্চতা */}
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-slate-800 mb-1">সারির উচ্চতা</h3>
            <p className="text-xs text-slate-500 mb-3">
              ⭐ ভরা আর ফাঁকা, দুই রকম সারিই সমান উঁচু হয়। আগে উচ্চতাটা
              আসত ভেতরের লেখা থেকে, তাই খালি সারিগুলো চ্যাপ্টা হয়ে যেত —
              হাতে কিছু লেখার জায়গাই থাকত না। হাতে লিখতে হলে মাপটা একটু
              বাড়িয়ে নিন; বেশি উঁচু করলে প্রতি পাতায় কমজন ধরবে।
            </p>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={ROW_HEIGHT_MAX}
                step={0.5}
                value={clampRowHeight(settings.rowHeight)}
                onChange={(e) => set({ rowHeight: clampRowHeight(e.target.value) })}
                className="flex-1 max-w-sm accent-violet-600"
              />

              <span className="w-28 text-center text-sm font-semibold text-slate-700">
                {clampRowHeight(settings.rowHeight) > 0
                  ? `${toBn(clampRowHeight(settings.rowHeight))} mm`
                  : `স্বয়ংক্রিয় (${toBn(rowHeightMm(settings))} mm)`}
              </span>

              {clampRowHeight(settings.rowHeight) > 0 && (
                <button
                  type="button"
                  onClick={() => set({ rowHeight: 0 })}
                  className="text-sm text-slate-500 hover:text-violet-700 font-medium whitespace-nowrap"
                >
                  স্বয়ংক্রিয়
                </button>
              )}
            </div>

            {/* ⭐ নমুনা — মাপটা কাগজে কেমন দেখাবে।

                ঘরগুলো আসল মাপেই (mm) আঁকা, আর লেখার আকারও কাগজেরটাই,
                তাই এখানে যতটুকু জায়গা দেখছেন কাগজেও ঠিক ততটুকুই পাবেন।
                উপরের দুইটা সারি ভরা, নিচের দুইটা ফাঁকা — দুইটা যে সমান
                উঁচু সেটাও এখানেই দেখা যায়। */}
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
              <p className="text-center text-[11px] font-semibold text-slate-500 mb-2">
                নমুনা — কাগজে এই উচ্চতায় বসবে
              </p>

              <table
                className="w-full border-collapse bg-white"
                style={{ fontSize: `${font}pt`, tableLayout: 'fixed' }}
              >
                <tbody>
                  {[
                    { sl: '১', name: 'মুহাম্মাদ আব্দুল্লাহ', mark: '' },
                    { sl: '২', name: 'রায়হান বিন ইকবাল', mark: '' },
                    { sl: '৩', name: '', mark: '' },
                    { sl: '', name: '', mark: '' },
                  ].map((r, i) => (
                    <tr key={i}>
                      {[r.sl, r.name, r.mark].map((v, j) => (
                        <td
                          key={j}
                          style={{
                            border: '0.25mm solid #1f2937',
                            padding: '0 1mm',
                            lineHeight: 1.25,
                            height: `${rowHeightMm(settings)}mm`,
                            width: j === 1 ? 'auto' : '18%',
                            textAlign: j === 1 ? 'left' : 'center',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                          }}
                        >
                          {v || '\u00A0'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="mt-2 text-center text-[11px] text-slate-400">
                উপরের দুইটা সারি ভরা, নিচের দুইটা ফাঁকা — দুইটাই সমান উঁচু
              </p>
            </div>
          </section>

          {/* ৯. শেষে ফাঁকা সারি */}
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-slate-800 mb-1">শেষে ফাঁকা সারি</h3>
            <p className="text-xs text-slate-500 mb-3">
              তালিকার শেষে কয়টা খালি সারি থাকবে — হাতে নাম তোলার জন্য।
              ⭐ আগে কলামটা ভরানোর জন্য বাকি জায়গাটুকু এমনিতেই খালি সারি দিয়ে
              ভরে যেত, তাই তিনজন শিক্ষার্থীর কাগজেও পঁচিশটা খালি ঘর ছাপা হত।
              এখন যতজন ততটুকুই ছক, আর খালি সারি লাগলে এখানে সংখ্যাটা বসান।
            </p>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={BLANK_ROWS_MAX}
                step={1}
                value={clampBlankRows(settings.blankRows)}
                onChange={(e) => set({ blankRows: clampBlankRows(e.target.value) })}
                className="flex-1 max-w-sm accent-violet-600"
              />
              <span className="w-16 text-center text-sm font-semibold text-slate-700">
                {toBn(clampBlankRows(settings.blankRows))} টি
              </span>
            </div>
          </section>
        </div>

        {/* ---- নিচের বোতাম ---- */}
        <div className="border-t border-slate-200 px-6 py-3 flex items-center gap-2 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            আগের অবস্থায়
          </button>

          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700"
            >
              সেভ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberSheetSettingsModal;