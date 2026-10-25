import { useEffect, useState } from 'react';
import {
  SECTIONS,
  borderStyleValue,
  cardsPerPageCount,
  defaultSeatCardSettings,
  fieldByKey,
  fieldsOfSection,
  loadSeatCardSettings,
  saveSeatCardSettings,
  isVisible,
  reorderFields,
  toggleField,
  visibleFieldsOfSection,
} from '../../Data/seatCardFields';

/**
 * সিট কার্ডের সেটিংস — ফি তালিকার মডালের মতোই নিয়ম।
 *
 * খোলার সময় সেভ করা সেটিংস তুলে আনে, "সেভ করুন" চাপলে localStorage এ
 * বসে আর onSaved দিয়ে পাতাটায় ফেরত যায়। বাতিল করলে কিছুই বদলায় না।
 *
 * ⭐ ক্রম বদলানো হয় টেনে (drag)।
 *
 * আগে উপরে-নিচের তীর ছিল, কিন্তু কাজ করছে বলে মনে হত না — কারণ সারিগুলো
 * সবসময় বাঁধা ক্রমে আঁকা হত (fieldsOfSection), সেভ করা ক্রমে নয়। ফলে
 * ক্রমটা বদলালেও পর্দায় কিছু নড়ত না, শুধু কাগজে বদল হত।
 *
 * এখন যেগুলো দেখাবে সেগুলো সেভ করা ক্রমেই উপরে বসে আর টেনে সরানো যায়,
 * নিচে আলাদা করে বন্ধ ঘরগুলো। টানাটানি একই ভাগের ভেতরেই চলে — মাথার
 * ঘর বড় ঘরে গিয়ে পড়ে না।
 *
 * src/components/Modals/SeatCardSettingsModal.jsx
 */
const SeatCardSettingsModal = ({ open, onClose, language = 1, onSaved }) => {
  const [draft, setDraft] = useState(defaultSeatCardSettings);
  const [dragKey, setDragKey] = useState(null);
  const [overKey, setOverKey] = useState(null);

  // খোলার প্রতিবারই সেভ করাটা তুলে আনি — আগের খোলার আধখেঁচড়া বদল যেন
  // বসে না থাকে
  useEffect(() => {
    if (open) {
      setDraft(loadSeatCardSettings(language));
      setDragKey(null);
      setOverKey(null);
    }
  }, [open, language]);

  if (!open) return null;

  const toggle = (key) => {
    setDraft((prev) => ({ ...prev, visible: toggleField(prev.visible, key) }));
  };

  /** টেনে আনা ঘরটাকে লক্ষ্য ঘরের জায়গায় বসানো — একই ভাগের ভেতরেই */
  const handleDrop = (targetKey) => {
    const from = dragKey;
    setDragKey(null);
    setOverKey(null);

    if (!from || from === targetKey) return;
    if (fieldByKey(from)?.section !== fieldByKey(targetKey)?.section) return;

    setDraft((prev) => ({
      ...prev,
      visible: reorderFields(prev.visible, from, targetKey),
    }));
  };

  const handleSave = () => {
    saveSeatCardSettings(language, draft);
    onSaved?.(draft);
    onClose?.();
  };

  const handleReset = () => setDraft(defaultSeatCardSettings());

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 print:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[88vh] overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col">
        {/* ---- মাথা ---- */}
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 px-5 py-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="text-white font-bold text-lg leading-tight">সিট কার্ড সেটিংস</h2>
            <p className="text-white/80 text-xs mt-0.5">
              টিক দিয়ে বাছুন, টেনে ক্রম বদলান
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto h-9 w-9 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center"
            title="বন্ধ করুন"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ---- ঘরগুলো ---- */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {SECTIONS.map((sec) => {
            const shown = visibleFieldsOfSection(draft, sec.key);
            const hidden = fieldsOfSection(sec.key).filter((f) => !isVisible(draft, f.key));

            return (
              <div key={sec.key} className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 flex items-center gap-2 border-b border-slate-200">
                  <span className="text-[13px] font-semibold text-slate-700">{sec.label}</span>
                  <span className="text-[12px] text-slate-500">({shown.length} টি দেখাবে)</span>
                  {shown.length > 1 && (
                    <span className="ml-auto text-[11px] text-slate-400">
                      ক্রম বদলাতে টেনে সরান
                    </span>
                  )}
                </div>

                {/* ---- যেগুলো দেখাবে, সেভ করা ক্রমেই ---- */}
                <div className="divide-y divide-slate-100">
                  {shown.map((f, i) => (
                    <div
                      key={f.key}
                      draggable
                      onDragStart={() => setDragKey(f.key)}
                      onDragEnd={() => {
                        setDragKey(null);
                        setOverKey(null);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (overKey !== f.key) setOverKey(f.key);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleDrop(f.key);
                      }}
                      className={`flex items-center gap-3 px-4 py-2.5 bg-white transition ${
                        dragKey === f.key ? 'opacity-40' : ''
                      } ${
                        overKey === f.key && dragKey && dragKey !== f.key
                          ? 'border-t-2 border-indigo-400'
                          : ''
                      }`}
                    >
                      {/* টানার হাতল */}
                      <span
                        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 shrink-0"
                        title="টেনে সরান"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <circle cx="7" cy="5" r="1.5" />
                          <circle cx="13" cy="5" r="1.5" />
                          <circle cx="7" cy="10" r="1.5" />
                          <circle cx="13" cy="10" r="1.5" />
                          <circle cx="7" cy="15" r="1.5" />
                          <circle cx="13" cy="15" r="1.5" />
                        </svg>
                      </span>

                      <span className="w-5 text-[12px] text-slate-400 shrink-0">{i + 1}.</span>

                      <label className="flex items-center gap-3 flex-1 cursor-pointer min-w-0">
                        <input
                          type="checkbox"
                          checked
                          onChange={() => toggle(f.key)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-800 font-medium truncate">
                          {f.label}
                        </span>
                      </label>
                    </div>
                  ))}

                  {shown.length === 0 && (
                    <p className="px-4 py-3 text-[13px] text-slate-400">
                      এই ভাগের কোনো ঘর দেখাবে না
                    </p>
                  )}
                </div>

                {/* ---- বন্ধ ঘরগুলো ---- */}
                {hidden.length > 0 && (
                  <div className="border-t border-slate-200 bg-slate-50/60">
                    {hidden.map((f) => (
                      <label
                        key={f.key}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer"
                      >
                        <span className="w-4 shrink-0" />
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => toggle(f.key)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-400">{f.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* ---- কাগজের সাজ ---- */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[13px] font-semibold text-slate-700">প্রতি পাতায় কার্ড:</span>
              {[
                { v: 8, text: '৮টি (২×৪)' },
                { v: 6, text: '৬টি (২×৩)' },
              ].map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() =>
                    setDraft((p) => ({ ...p, cardsPerPage: cardsPerPageCount(opt.v) }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                    cardsPerPageCount(draft.cardsPerPage) === opt.v
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt.text}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[13px] font-semibold text-slate-700">কার্ডের দাগ:</span>
              {[
                { v: 'dashed', text: 'কাটা দাগ' },
                { v: 'solid', text: 'টানা দাগ' },
              ].map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() =>
                    setDraft((p) => ({ ...p, borderStyle: borderStyleValue(opt.v) }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                    borderStyleValue(draft.borderStyle) === opt.v
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt.text}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.showWatermark !== false}
                onChange={(e) => setDraft((p) => ({ ...p, showWatermark: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700">জলছাপ দেখাবে (মাদরাসার লোগো)</span>
            </label>
          </div>
        </div>

        {/* ---- নিচের বোতাম ---- */}
        <div className="border-t border-slate-200 px-5 py-3 flex items-center gap-2 bg-slate-50">
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
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
            >
              সেভ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatCardSettingsModal;
