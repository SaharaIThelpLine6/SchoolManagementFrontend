import { Buffer } from 'buffer';
import { useEffect, useState } from 'react';
import {
  SECTIONS,
  borderStyleValue,
  cardsPerPageCount,
  defaultSeatCardSettings,
  fieldByKey,
  fieldsOfSection,
  loadSeatCardSettings,
  normalizeSeatCardSettings,
  saveSeatCardSettings,
  isVisible,
  reorderFields,
  toBn,
  toggleField,
  visibleFieldsOfSection,
} from '../../Data/seatCardFields';
import {
  FONT_SCALE_DEFAULT,
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  SEAT_TEMPLATES,
  WATERMARK_MAX,
  WATERMARK_MIN,
  boxLayout,
  clampFontScale,
  clampWatermarkOpacity,
  detailAlign,
  detailFill,
  frameCss,
  getSeatTemplate,
  hasSignRow,
  headLogoSide,
  titleStyle,
} from '../../Data/seatCardTemplates';
import {
  useGetInstitutionInfoQuery,
  useGetSeatCardSettingsQuery,
  useSaveSeatCardSettingsMutation,
} from '../../features/settings/settingsQuerySlice';
import SeatCardFace, {
  seatCardFaceCss,
} from '../../pages/userpanel/SeatCard/Seatcardface';

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
 * ⭐ ডিজাইন, লেখার আকার, জলছাপ
 *
 * উপরে ডিজাইনের গ্যালারি — প্রতিটার ছোট নমুনা দেখা যায়, বেছে নিলেই
 * কার্ড ওই সাজে বসে। ডিজাইন বদলালে কোনো ঘর হারায় না; যা যা দেখাতে বলা
 * আছে সবই থাকে, শুধু চেহারাটা বদলায় (seatCardTemplates.js দেখুন)।
 *
 * সেটিংসটা একসাথে দুই জায়গায় যায় — localStorage এ সাথে সাথে (তাই
 * ছাপাটা দেরি করে না) আর ডেটাবেজে (তাই অন্য কম্পিউটারে লগইন করলেও
 * একই সাজ পাওয়া যায়)। সার্ভারে এন্ডপয়েন্টটা না থাকলেও কিছু ভাঙে না,
 * তখন শুধু localStorage টাই চলে।
 *
 * src/components/Modals/SeatCardSettingsModal.jsx
 */
/**
 * ডেটাবেজ থেকে আসা মানটা বের করা।
 *
 * সার্ভার কোন খোলসে পাঠাবে তা আগে থেকে বলা যায় না — কেউ
 * { data: { Settings } }, কেউ { Settings }, কেউ সরাসরি অবজেক্ট পাঠায়;
 * আর Settings টা string ও হতে পারে (JSON কলামে রাখা থাকলে)। তাই সবগুলো
 * চেহারাই মেনে নিই, নইলে একটুখানি অমিলেই সেটিংস ডিফল্টে ফিরে যেত।
 */
const unwrapSaved = (payload) => {
  const raw =
    payload?.data?.Settings ?? payload?.Settings ?? payload?.data ?? payload;

  if (!raw) return null;

  const obj =
    typeof raw === 'string'
      ? (() => {
          try {
            return JSON.parse(raw);
          } catch {
            return null;
          }
        })()
      : raw;

  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;

  /* ⭐ খোলসটাই সেটিংস ভেবে নেওয়া চলবে না।
   *
   * এখনো কিছু সেভ করা না থাকলে সার্ভার { success: true, data: null }
   * পাঠায়। উপরের ?? গুলো null পেরিয়ে শেষে গোটা উত্তরটাই ধরে ফেলত,
   * আর ওটাকে সেটিংস ভেবে normalize করলে সব ডিফল্টে ফিরে যেত — শুধু
   * তাই নয়, ওই ডিফল্টটা localStorage এও বসে যেত, মানে ব্রাউজারে সেভ
   * করা সাজটাই মুছে যেত। তাই সেটিংসের নিজের চেনা ঘর আছে কি না দেখে
   * নিই। */
  const looksLikeSettings =
    Array.isArray(obj.visible) ||
    'templateId' in obj ||
    'cardsPerPage' in obj ||
    'fontScale' in obj;

  return looksLikeSettings ? obj : null;
};

/**
 * ডিজাইনের ছোট নমুনা।
 *
 * আসল কার্ডটা আঁকি না — শুধু কয়েকটা পট্টি আর ঘর দিয়ে চেহারার আভাস।
 * আসল কার্ড আঁকতে গেলে মডালে ছাপার হিসাব টেনে আনতে হত, আর নমুনা এত
 * ছোট যে লেখা পড়াই যেত না। পট্টির সাজেই বোঝা যায় কোনটা কেমন।
 */
const TemplatePreview = ({ template }) => {
  const t = getSeatTemplate(template);
  const line = t.frame?.color || '#000000';
  const headBg = t.head?.bg === 'none' ? 'transparent' : t.head.bg;
  const logo = headLogoSide(t.id);
  const boxes = boxLayout(t.id);
  const fill = detailFill(t.id);
  const centered = detailAlign(t.id) === 'center';
  const title = titleStyle(t.id);

  const dot = (w) => (
    <span
      className="inline-block h-[3px] rounded-full"
      style={{ width: w, background: line, opacity: 0.55 }}
    />
  );

  return (
    <div
      className="h-[74px] w-full overflow-hidden bg-white flex flex-col"
      style={{
        border: frameCss(t.frame),
        borderRadius: `${(t.frame?.radius ?? 0) * 1.6}px`,
        justifyContent: t.density === 'spread' ? 'space-between' : 'flex-start',
      }}
    >
      {/* মাথা */}
      <div
        className="flex items-center gap-1 px-1.5 py-1"
        style={{
          background: headBg,
          borderBottom: t.head?.divider ? `1px solid ${line}` : 'none',
        }}
      >
        {logo === 'left' && (
          <span
            className="h-3 w-3 rounded-full shrink-0"
            style={{ border: `1px solid ${t.head?.color || line}`, opacity: 0.6 }}
          />
        )}
        <div className="flex-1 min-w-0 flex flex-col items-center gap-[2px]">
          <span
            className="block h-[4px] w-[70%] rounded-full"
            style={{ background: t.head?.color || line, opacity: 0.85 }}
          />
          <span
            className="block h-[2px] w-[45%] rounded-full"
            style={{ background: t.head?.color || line, opacity: 0.45 }}
          />
        </div>
        {logo === 'right' && (
          <span
            className="h-3 w-3 rounded-full shrink-0"
            style={{ border: `1px solid ${t.head?.color || line}`, opacity: 0.6 }}
          />
        )}
      </div>

      {/* শিরোনামের পট্টি */}
      {title !== 'none' && (
        <div className="flex justify-center py-[2px]">
          <span
            className="h-[7px] w-[42%]"
            style={{
              border: `1px solid ${line}`,
              borderRadius: title === 'pill' ? '999px' : '1px',
              opacity: 0.6,
            }}
          />
        </div>
      )}

      {/* মাঝের অংশ */}
      <div className="flex items-center gap-1.5 px-1.5 py-[3px]">
        <div
          className={`flex-1 min-w-0 flex flex-col gap-[3px] ${
            centered ? 'items-center' : 'items-start'
          }`}
        >
          {dot('80%')}
          {dot(fill === 'none' ? '55%' : '80%')}
          {dot(fill === 'none' ? '45%' : '80%')}
        </div>

        {boxes === 'right' && (
          <span
            className="h-[26px] w-[22px] shrink-0"
            style={{ border: `1px solid ${line}`, opacity: 0.7 }}
          />
        )}
      </div>

      {/* নিচের অংশ */}
      {(boxes === 'joined' || boxes === 'separate') && (
        <div className={`flex px-1.5 pb-1 ${boxes === 'separate' ? 'gap-1' : ''}`}>
          {[0, 1].map((i) => (
            <span
              key={i}
              className="h-[13px] flex-1"
              style={{
                border: `1px solid ${line}`,
                borderLeftWidth: boxes === 'joined' && i > 0 ? 0 : 1,
                opacity: 0.7,
              }}
            />
          ))}
        </div>
      )}

      {boxes === 'none' && hasSignRow(t.id) && (
        <div className="flex gap-2 px-1.5 pb-1">
          {[0, 1].map((i) => (
            <span
              key={i}
              className="h-[2px] flex-1 rounded-full"
              style={{ background: line, opacity: 0.5 }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ───────────────────────────────────────────────────────────────────────────
   নমুনার মাপ

   নমুনাটা আসল কার্ডের মাপেই আঁকা হয় (mm এ), তারপর ছোট করে দেখানো হয়।
   আন্দাজে একটা চৌকো এঁকে দিলে লেখা আসলে ধরবে কি না বোঝা যেত না — এখন
   নমুনায় যা আঁটে, কাগজেও ঠিক তাই আঁটে।
   ─────────────────────────────────────────────────────────────────────────── */
const MM = 96 / 25.4;          // ১mm কত px (৯৬dpi)
const PREVIEW_SCALE = 0.72;    // নমুনাটা কতটা ছোট করে দেখানো হবে

/** পাতার হিসাব থেকে একটা কার্ডের আসল মাপ (mm) */
const cardSize = (perPage) => {
  const rows = perPage / 2;
  return {
    w: (210 - 2 * 10 - 4) / 2,
    h: (297 - 2 * 10 - (rows - 1) * 4) / rows,
  };
};

/**
 * লোগো SQL Server এ varbinary, তাই বাইট হয়েই আসে।
 * BSeatNoWhite এর toImageSrc এর হুবহু একই।
 */
const toImageSrc = (img) => {
  if (!img) return '';
  if (typeof img === 'string') return img;
  if (img?.data) return `data:image/png;base64,${Buffer.from(img.data).toString('base64')}`;
  return '';
};

/** নমুনার জন্য একটা বানানো সারি — আসল শিক্ষার্থীর বদলে */
const demoRow = (info) => ({
  InstitutionName: info?.InstitutionName || 'আপনার প্রতিষ্ঠানের নাম',
  Address: info?.Address || 'ঠিকানা',
  ExamName: 'বার্ষিক পরীক্ষা - ২০২৬',

  ColumnNo: '৩',
  BenchNo: '৫',
  SeatNum: '০১',

  UserName: 'মুহাম্মাদ আব্দুল্লাহ',
  UserCode: '৬০৭০',
  SubClass: '৩য় শ্রেণি',
  HallName: '৩০১',
});

const SeatCardSettingsModal = ({
  open,
  onClose,
  language = 1,
  onSaved,
  // ExamReportList যদি লোগোটা হাতে পায় তবে এখানে দিতে পারে; না দিলে
  // নিচে settings API থেকেই আনা হয়
  instituteLogo = '',
}) => {
  const [draft, setDraft] = useState(defaultSeatCardSettings);
  const [dragKey, setDragKey] = useState(null);
  const [overKey, setOverKey] = useState(null);

  // নমুনাটা কোন ধরনের কাগজের — আসন নং সহ না ছাড়া
  const [previewSeat, setPreviewSeat] = useState(true);

  const { data: institutionInfo } = useGetInstitutionInfoQuery();

  // ডেটাবেজের সেটিংস — মডাল খোলা না থাকলে ডাকি না (skip)
  const { data: remote, isFetching: loadingRemote } = useGetSeatCardSettingsQuery(
    language,
    { skip: !open }
  );
  const [saveRemote, { isLoading: savingRemote }] = useSaveSeatCardSettingsMutation();

  // খোলার প্রতিবারই সেভ করাটা তুলে আনি — আগের খোলার আধখেঁচড়া বদল যেন
  // বসে না থাকে
  useEffect(() => {
    if (open) {
      setDraft(loadSeatCardSettings(language));
      setDragKey(null);
      setOverKey(null);
    }
  }, [open, language]);

  // ডেটাবেজ থেকে এলে সেটাই চালাই — অন্য কম্পিউটারে করা বদলটা যেন এখানেও
  // আসে। না এলে (এন্ডপয়েন্ট নেই বা এখনো কিছু সেভ হয়নি) localStorage এর
  // মানটাই থেকে যায়, তাই কিছু হারায় না।
  useEffect(() => {
    if (!open) return;

    const saved = unwrapSaved(remote);
    if (!saved) return;

    const next = normalizeSeatCardSettings(saved);
    setDraft(next);

    // ⭐ ডেটাবেজের মানটা localStorage এও বসিয়ে রাখি।
    //
    // কাগজটা (BSeatNoWhite) সেটিংস পায় localStorage থেকে — সার্ভারে
    // ডাকাডাকি করে না, কারণ ছাপার সময় দেরি করা চলে না। তাই ডেটাবেজ
    // থেকে আসা মানটা এখানে জমিয়ে রাখলে নতুন কম্পিউটারেও পরের বার
    // ছাপা ওই সাজেই হয়।
    saveSeatCardSettings(language, next);
  }, [open, remote, language]);

  if (!open) return null;

  const logo =
    instituteLogo ||
    toImageSrc(institutionInfo?.Logo ?? institutionInfo?.InstitutionLogo);

  const card = cardSize(cardsPerPageCount(draft.cardsPerPage));

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

  const handleSave = async () => {
    // আগে ব্রাউজারে — এটা কখনো ব্যর্থ হয় না, তাই ছাপাটা সার্ভারের
    // অপেক্ষায় বসে থাকে না
    saveSeatCardSettings(language, draft);
    onSaved?.(draft);

    // তারপর ডেটাবেজে। ব্যর্থ হলে চুপচাপ ছেড়ে দিই — সেটিংস তো ব্রাউজারে
    // বসেই গেছে, এখানে একটা লাল বার্তা দেখিয়ে কাজটা আটকানোর কোনো মানে নেই
    try {
      await saveRemote({ languageId: language, settings: draft }).unwrap();
    } catch {
      /* সার্ভারে না গেলেও চলবে */
    }

    onClose?.();
  };

  const handleReset = () => setDraft(defaultSeatCardSettings());

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 print:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* নমুনার কার্ডটা আসল কার্ডের CSS দিয়েই আঁকা — তাই সেটিংসে যা
          দেখবেন কাগজে হুবহু তাই ছাপা হবে */}
      <style>{seatCardFaceCss}</style>

      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col">
        {/* ---- মাথা ---- */}
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 px-5 py-4 flex items-center gap-3 shrink-0">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="text-white font-bold text-lg leading-tight">সিট কার্ড সেটিংস</h2>
            <p className="text-white/80 text-xs mt-0.5">
              বাঁয়ে ডিজাইন, ডানে ঘর ও মাপ — নমুনায় সাথে সাথে দেখা যায়
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

        {/* ================= দুই ভাগ: বাঁয়ে ডিজাইন, ডানে বাকি সব ============= */}
        <div className="flex-1 min-h-0 flex">
          {/* ---------- বাঁ পাশ: নমুনা + ডিজাইন ---------- */}
          <div className="w-[320px] shrink-0 border-r border-slate-200 flex flex-col overflow-y-auto bg-slate-50/50">
            {/* ---- নমুনা: উপরে আটকে থাকে, তাই ডানে যা-ই বদলান চোখের সামনেই ---- */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[13px] font-semibold text-slate-700">নমুনা</span>

                <div className="ml-auto flex rounded-lg border border-slate-200 overflow-hidden">
                  {[
                    { v: true, text: 'আসন নং সহ' },
                    { v: false, text: 'ছাড়া' },
                  ].map((opt) => (
                    <button
                      key={String(opt.v)}
                      type="button"
                      onClick={() => setPreviewSeat(opt.v)}
                      className={`px-2 py-1 text-[11px] font-medium transition ${
                        previewSeat === opt.v
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* ভিতরের কার্ডটা আসল মাপে আঁকা, তারপর ছোট করে দেখানো —
                  তাই লেখা বড় করলে ঘরে আঁটছে কি না এখানেই বোঝা যায় */}
              <div
                className="mx-auto overflow-hidden"
                style={{
                  width: `${card.w * MM * PREVIEW_SCALE}px`,
                  height: `${card.h * MM * PREVIEW_SCALE}px`,
                }}
              >
                <div
                  style={{
                    width: `${card.w}mm`,
                    height: `${card.h}mm`,
                    transform: `scale(${PREVIEW_SCALE})`,
                    transformOrigin: 'top left',
                  }}
                >
                  <SeatCardFace
                    row={demoRow(institutionInfo)}
                    settings={draft}
                    logo={logo}
                    withSeat={previewSeat}
                  />
                </div>
              </div>

              <p className="mt-2 text-[11px] text-slate-400 text-center leading-relaxed">
                আসল কার্ডের মাপেই আঁকা, শুধু ছোট করে দেখানো
              </p>
            </div>

            {/* ---- ডিজাইন বাছাই ---- */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[13px] font-semibold text-slate-700">কার্ডের ডিজাইন</span>
                <span className="text-[12px] text-slate-500 truncate">
                  ({getSeatTemplate(draft.templateId).title})
                </span>
                {loadingRemote && (
                  <span className="ml-auto text-[11px] text-slate-400 shrink-0">আসছে…</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {SEAT_TEMPLATES.map((t) => {
                  const picked = getSeatTemplate(draft.templateId).id === t.id;

                  return (
                    <button
                      key={t.id}
                      type="button"
                      title={t.note}
                      onClick={() => setDraft((p) => ({ ...p, templateId: t.id }))}
                      className={`text-left rounded-lg border p-1.5 transition ${
                        picked
                          ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50/40'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <TemplatePreview template={t.id} />
                      <span
                        className={`block mt-1.5 text-[12px] font-medium truncate ${
                          picked ? 'text-indigo-700' : 'text-slate-600'
                        }`}
                      >
                        {t.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
                ডিজাইন বদলালে কোনো তথ্য হারায় না — ডানে যেগুলো দেখাতে বলা
                আছে সবই থাকে, শুধু সাজটা বদলায়।
              </p>
            </div>
          </div>

          {/* ---------- ডান পাশ: ঘর, কাগজের সাজ, মাপ ---------- */}
          <div className="flex-1 min-w-0 p-5 space-y-5 overflow-y-auto">
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

              {/* ---- লেখার আকার ---- */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-slate-700">লেখার আকার:</span>
                  <span className="text-[13px] font-semibold text-indigo-600">
                    {toBn(clampFontScale(draft.fontScale))}%
                  </span>
                  {clampFontScale(draft.fontScale) !== FONT_SCALE_DEFAULT && (
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((p) => ({ ...p, fontScale: FONT_SCALE_DEFAULT }))
                      }
                      className="ml-auto text-[11px] text-slate-400 hover:text-slate-600"
                    >
                      আগের মাপে
                    </button>
                  )}
                </div>

                <input
                  type="range"
                  min={FONT_SCALE_MIN}
                  max={FONT_SCALE_MAX}
                  step={5}
                  value={clampFontScale(draft.fontScale)}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, fontScale: clampFontScale(e.target.value) }))
                  }
                  className="mt-2 w-full accent-indigo-600"
                />

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>ছোট ({toBn(FONT_SCALE_MIN)}%)</span>
                  <span>বড় ({toBn(FONT_SCALE_MAX)}%)</span>
                </div>

                <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                  আসন নং এর বড় ঘরগুলোর মাপ এতে বদলায় না — ওগুলো সব জায়গায়
                  এক, নইলে বড় করলে নম্বরটা ঘরে আঁটত না।
                </p>
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

              {/* ---- জলছাপের ঘনত্ব — জলছাপ বন্ধ থাকলে দেখানোর দরকার নেই ---- */}
              {draft.showWatermark !== false && (
                <div className="pl-7">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-slate-600">জলছাপের ঘনত্ব:</span>
                    <span className="text-[13px] font-semibold text-indigo-600">
                      {toBn(clampWatermarkOpacity(draft.watermarkOpacity))}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min={WATERMARK_MIN}
                    max={WATERMARK_MAX}
                    step={1}
                    value={clampWatermarkOpacity(draft.watermarkOpacity)}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        watermarkOpacity: clampWatermarkOpacity(e.target.value),
                      }))
                    }
                    className="mt-2 w-full accent-indigo-600"
                  />

                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>হালকা ({toBn(WATERMARK_MIN)}%)</span>
                    <span>গাঢ় ({toBn(WATERMARK_MAX)}%)</span>
                  </div>

                  {!logo && (
                    <p className="mt-1 text-[11px] text-amber-600 leading-relaxed">
                      প্রতিষ্ঠানের লোগো পাওয়া যায়নি, তাই নমুনায় জলছাপ দেখা
                      যাচ্ছে না। সেটিংসে লোগো বসালে কাগজেও বসবে।
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---- নিচের বোতাম ---- */}
        <div className="border-t border-slate-200 px-5 py-3 flex items-center gap-2 bg-slate-50 shrink-0">
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
              disabled={savingRemote}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {savingRemote ? 'সেভ হচ্ছে…' : 'সেভ করুন'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatCardSettingsModal;
