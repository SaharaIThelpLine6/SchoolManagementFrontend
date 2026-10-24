import React, { useEffect, useMemo, useRef, useState } from 'react';

import { AdmitCardFace } from './AdmitCardGenerate';
import { RoutineCardFace } from './AdmitCardRoutinegenerate';
import {
  CARD_H,
  CARD_W,
  DEFAULT_ADMIT_LANG,
  getAdmitDir,
  getFieldDemo,
  getFieldName,
} from '../Data/admitCardConfig';
import {
  ROUTINE_CARD_H,
  ROUTINE_CARD_W,
  getRoutineDemoRows,
} from '../Data/admitCardRoutineconfig';
import {
  OFFSET_KEYS,
  OFFSET_LIMIT,
  ZERO_OFFSETS,
  buildUploadedTemplate,
  buildAssetUrl,
  checkUploadFile,
  formatBytes,
  formatSize,
  getOffsetLabel,
  getUploadSpec,
  getUploadUIText,
  hasOffsets,
  readOffsets,
  readOverlay,
  sanitizeOffsets,
  sanitizeDesign,
  OVERLAY_KEY,
  uploadErrorText,
} from '../Data/Admitcarduploadconfig';

const PREVIEW_FIELDS = ['StudentName', 'FatherName', 'SubClass', 'StudentCode'];

/**
 * একটা ঘরের উপর-নিচের সারি — স্লাইডার, দুটো বোতাম আর বর্তমান মানটা।
 *
 * স্লাইডারে বাঁ দিক মানে উপরে (ঋণাত্মক), ডান দিক মানে নিচে। কার্ডে যেদিকে
 * সরবে স্লাইডারও সেদিকেই যায়, তাই কোনটা কী করছে মনে রাখতে হয় না।
 * বোতাম দুটো এক ধাপ (১px) করে নাড়ায় — শেষ মুহূর্তের সূক্ষ্ম মিলটা
 * স্লাইডারের চেয়ে বোতামে ধরা সহজ।
 */
const ZoneRow = ({ label, value, onChange, onNudge, t }) => {
  const v = Number(value) || 0;

  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-gray-700">{label}</span>
        <span
          className={`text-[12px] tabular-nums ${
            v === 0 ? 'text-gray-400' : 'font-bold text-blue-700'
          }`}
        >
          {t('offsetHint')(v)}
        </span>
      </div>

      <div className="mt-1.5 flex items-center gap-2" dir="ltr">
        <button
          type="button"
          onClick={() => onNudge(-1)}
          title={t('up')}
          className="h-7 w-7 shrink-0 rounded-[6px] border border-gray-300 bg-white text-[14px] leading-none text-gray-600 hover:bg-gray-100"
        >
          ↑
        </button>

        <input
          type="range"
          min={-OFFSET_LIMIT}
          max={OFFSET_LIMIT}
          step={1}
          value={v}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-1.5 flex-1 cursor-pointer accent-blue-600"
        />

        <button
          type="button"
          onClick={() => onNudge(1)}
          title={t('down')}
          className="h-7 w-7 shrink-0 rounded-[6px] border border-gray-300 bg-white text-[14px] leading-none text-gray-600 hover:bg-gray-100"
        >
          ↓
        </button>

        <input
          type="number"
          min={-OFFSET_LIMIT}
          max={OFFSET_LIMIT}
          value={v}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-14 shrink-0 rounded-[6px] border border-gray-300 px-1.5 py-1 text-center text-[13px] tabular-nums"
        />
      </div>
    </div>
  );
};

/**
 * নিজের ডিজাইনের পর্দা — আপলোড ও ঘর ঠিক করা, দুটোই।
 *
 * ধাপ:
 *   ১) ছবি বাছা     → ধরণ, আকার ও পিক্সেল মাপ যাচাই হয়। মাপ হুবহু না
 *                     মিললে ছবিটা নেওয়াই হয় না।
 *   ২) প্রিভিউ       → আসল কার্ড কম্পোনেন্টেই আঁকা, তাই যা দেখা যায়
 *                     ছাপাতেও হুবহু তাই আসে।
 *   ৩) ঘর ঠিক করা   → চারটে ঘর — হেডার, "প্রবেশপত্র", তথ্য, স্বাক্ষর —
 *                     আলাদা আলাদা উপর-নিচ করা যায়। প্রিভিউ সাথে সাথেই
 *                     বদলায়, তাই মিলিয়ে নিতে অনুমান করতে হয় না।
 *   ৪) আপলোড
 *
 * ঘরের মাপ, রঙ, ছবির মাপ — কিছুই বদলানো যায় না, সব এক জায়গায় বাঁধা
 * (admitCardUploadConfig.js এর UPLOAD_DESIGN)। শুধু চারটে ঘরের উপর-নিচ
 * প্রতিটা ডিজাইনের সাথে জমা থাকে, কারণ প্রতিষ্ঠানভেদে ব্যানারের উচ্চতা
 * আলাদা হয়।
 *
 * `record` দিলে পর্দাটা সম্পাদনার মোডে খোলে — নতুন ছবি লাগে না, আগের
 * ডিজাইনের ঘরগুলোই সরিয়ে সংরক্ষণ করা যায়।
 */
const AdmitTemplateUpload = ({
  open,
  mode = 'A5',                 // 'A5' = প্রবেশপত্র, 'A4' = রুটিনসহ
  lang = DEFAULT_ADMIT_LANG,
  instName,
  instAddress,
  institutionInfo,
  watermarkLogo,
  apiUrl,                      // সম্পাদনার সময় জমা ছবিটা দেখাতে
  record = null,               // দিলে সম্পাদনার মোড, নইলে নতুন আপলোড
  onClose,
  onUpload,                    // async (FormData) => void
  onSaveOffsets,               // async (id, offsets) => void — সম্পাদনায়
}) => {
  const spec = getUploadSpec(mode);
  const t = (key) => getUploadUIText(key, lang);
  const dir = getAdmitDir(lang);
  const isRoutine = String(mode) === 'A4';

  const inputRef = useRef(null);
  const urlRef = useRef('');

  const editing = Boolean(record?.id);

  const [file, setFile] = useState(null);
  const [imgUrl, setImgUrl] = useState('');
  const [imgSize, setImgSize] = useState(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // চারটে ঘরের উপর-নিচ — এটুকুই প্রতিটা ডিজাইনের সাথে জমা থাকে
  const [offsets, setOffsets] = useState(ZERO_OFFSETS);

  // ছাপা কাগজের উপর ছাপা — এটাও ডিজাইনের সাথেই জমে
  const [overlay, setOverlay] = useState(false);

  // প্রিভিউতে কী দেখছি — ডিজাইনসহ, নাকি যা ছাপা হবে কেবল সেটুকু
  const [simPrint, setSimPrint] = useState(false);

  const setOffset = (key, value) =>
    setOffsets((prev) => sanitizeOffsets({ ...prev, [key]: value }));

  const nudge = (key, step) =>
    setOffsets((prev) => sanitizeOffsets({ ...prev, [key]: (prev[key] || 0) + step }));

  // পপআপ বন্ধ হলে সব মুছে ফেলি — পরেরবার খুললে যেন আগের ছবি পড়ে না থাকে
  useEffect(() => {
    if (open) return undefined;
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = '';
    }
    setFile(null);
    setImgUrl('');
    setImgSize(null);
    setTitle('');
    setError('');
    setBusy(false);
    setOffsets(ZERO_OFFSETS);
    setOverlay(false);
    setSimPrint(false);
    return undefined;
  }, [open]);

  // সম্পাদনার মোডে জমা থাকা মানগুলো তুলে আনি। useEffect এ করলে প্রথম
  // ফ্রেমে সব শূন্য দেখিয়ে তারপর লাফ দিত, তাই রেন্ডারের সময়েই — React এর
  // "প্রপ বদলালে state ঠিক করা" নিয়মেই, একবারই চলে।
  const [loadedId, setLoadedId] = useState(null);

  if (open && editing && loadedId !== record.id) {
    setLoadedId(record.id);
    setOffsets(readOffsets(record));
    setOverlay(readOverlay(record));
    setTitle(record.title || '');
    setError('');
  }

  if (!open && loadedId !== null) setLoadedId(null);

  // সম্পাদনায় ছবিটা সার্ভারের, নতুন আপলোডে সদ্য বাছা ফাইলের objectURL
  const previewUrl =
    imgUrl || (editing ? buildAssetUrl(record.file, apiUrl) : '');

  // Esc চাপলে বন্ধ — আপলোড চলতে থাকলে নয়
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onClose]);

  const handleFile = (picked) => {
    setError('');
    if (!picked) return;

    const url = URL.createObjectURL(picked);

    const img = new Image();
    img.onload = () => {
      const size = { w: img.naturalWidth, h: img.naturalHeight };
      const result = checkUploadFile(picked, size, mode);

      if (!result.ok) {
        // ভুল মাপের ছবি বসানোই হয় না — সার্ভারে পাঠানোর অপেক্ষাও
        // করতে হয় না, সাথে সাথেই কারণটা পর্দায় আসে
        URL.revokeObjectURL(url);
        setError(uploadErrorText(result.code, mode, lang, size));
        if (inputRef.current) inputRef.current.value = '';
        return;
      }

      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = url;

      setFile(picked);
      setImgUrl(url);
      setImgSize(size);
      if (!title.trim()) {
        setTitle(picked.name.replace(/\.[^.]+$/, '').slice(0, 40));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError(uploadErrorText('unreadable', mode, lang));
      if (inputRef.current) inputRef.current.value = '';
    };

    img.src = url;
  };

  // প্রিভিউর টেমপ্লেট — আপলোডের পর সার্ভার থেকে এসে যে অবজেক্টটা বানানো
  // হবে, হুবহু সেটাই। তাই প্রিভিউ আর ছাপার মধ্যে কোনো ফারাক থাকে না।
  const template = useMemo(
    () =>
      buildUploadedTemplate(
        { id: 'preview', mode, title: title || 'preview' },
        { image: previewUrl, offsets, overlay }
      ),
    [mode, title, previewUrl, offsets, overlay]
  );

  const student = useMemo(() => {
    const row = {
      institute_name: instName,
      institute_address: instAddress,
      ExamName: getFieldDemo('ExamName', lang),
      SessionName: getFieldDemo('SessionName', lang),
      NajemName: institutionInfo?.NajemName,
      PrincipalName: institutionInfo?.PrincipalName,
      SignatureNajem: institutionInfo?.SignatureNajem,
      SignaturePrincipal: institutionInfo?.SignaturePrincipal,
    };
    PREVIEW_FIELDS.forEach((f) => {
      row[f] = getFieldDemo(f, lang);
      row[`fieldkey_${f}`] = getFieldName(f, lang);
    });
    return row;
  }, [instName, instAddress, institutionInfo, lang]);

  const demoRoutine = useMemo(() => getRoutineDemoRows(lang), [lang]);

  const handleUpload = async () => {
    // সম্পাদনার মোডে নতুন ছবি লাগে না — শুধু ঘরগুলোই সংরক্ষণ হয়
    if (editing) {
      setBusy(true);
      setError('');
      try {
        await onSaveOffsets?.(
          record.id,
          sanitizeDesign({ ...offsets, [OVERLAY_KEY]: overlay })
        );
        onClose?.();
      } catch (err) {
        setError(err?.data?.error || err?.message || t('errUpload'));
      } finally {
        setBusy(false);
      }
      return;
    }

    if (!file) {
      setError(t('errNoFile'));
      return;
    }

    setBusy(true);
    setError('');

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('mode', mode);
      form.append('title', title.trim().slice(0, 40));
      // ঘরের মাপ ও রঙ কোডেরটাই; রেকর্ডে শুধু চারটে উপর-নিচ আর
      // "ছাপা কাগজের উপর ছাপা" চালু কি না — এটুকুই জমে
      form.append(
        'design',
        JSON.stringify(sanitizeDesign({ ...offsets, [OVERLAY_KEY]: overlay }))
      );

      await onUpload?.(form);
      onClose?.();
    } catch (err) {
      setError(err?.data?.error || err?.message || t('errUpload'));
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  const cardW = isRoutine ? ROUTINE_CARD_W : CARD_W;
  const cardH = isRoutine ? ROUTINE_CARD_H : CARD_H;
  // পপআপে আঁটানোর জন্য ছোট করে দেখাই — ভিতরের কিছুই বদলায় না
  const scale = isRoutine ? 0.68 : 1;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-black/60 p-4 overflow-y-auto hidden_in_print"
      onClick={() => !busy && onClose?.()}
    >
      <div
        className="bg-white rounded-xl w-full max-w-5xl my-6 flex flex-col max-h-[92vh] overflow-hidden shadow-2xl"
        dir={dir}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ------------------------------------------------------- হেডার */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h3 className="text-[18px] font-bold">
            {editing ? t('editTitle') : t('uploadTitle')}{' '}
            <span className="text-gray-400">({mode})</span>
          </h3>
          <button
            type="button"
            className="text-[26px] leading-none text-gray-500 hover:text-gray-800"
            onClick={() => !busy && onClose?.()}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto px-4 sm:px-6 py-5">
          {/* ============================================ মাপের নিয়ম
              সবার উপরে, ছবি বাছার আগেই — তাই কোন মাপে বানাতে হবে তা
              আগে থেকেই জানা যায়, ভুল মাপের ছবি বানিয়ে আসতে হয় না। */}
          {editing ? null : (
          <div className="rounded-[10px] border border-blue-200 bg-blue-50/60 px-4 py-3">
            <p className="text-[14px] font-bold text-blue-900">{t('sizeRule')}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-blue-900/80">
              {t('sizeRuleText')(
                formatSize(spec.width, spec.height, lang),
                formatBytes(spec.maxBytes, lang)
              )}
            </p>
            {imgSize ? (
              <p className="mt-1.5 text-[13px] font-bold text-green-700">
                ✓ {t('yourSize')}: {formatSize(imgSize.w, imgSize.h, lang)}
              </p>
            ) : null}
          </div>
          )}

          {error ? (
            <p className="mt-3 rounded-[8px] border border-red-200 bg-red-50 px-4 py-2 text-[13px] font-medium text-red-700">
              {error}
            </p>
          ) : null}

          {/* ---------------------------------------------- ছবি ও নাম
              সম্পাদনার মোডে ছবি বদলানোর কিছু নেই — ঐ ডিজাইনটাই থাকে,
              শুধু ঘরগুলো সরে। তাই এই অংশটা তখন দেখানোই হয় না। */}
          {editing ? null : (
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-[8px] border-2 border-blue-500 bg-white px-5 py-2 text-[14px] font-bold text-blue-700 hover:bg-blue-50 transition"
            >
              {previewUrl ? t('changeFile') : t('pickFile')}
            </button>

            <label className="flex-1 min-w-[200px]">
              <span className="block text-[12px] text-gray-500 mb-1">
                {t('designName')}
              </span>
              <input
                type="text"
                value={title}
                maxLength={40}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-[8px] border border-gray-300 px-3 py-2 text-[14px]"
              />
            </label>
          </div>
          )}

          {/* ছবি না বাছা পর্যন্ত প্রিভিউ দেখানোর কিছু নেই */}
          {!previewUrl ? (
            <div className="mt-6 flex h-[220px] items-center justify-center rounded-[10px] border-2 border-dashed border-gray-300 bg-gray-50">
              <p className="text-[14px] text-gray-500">{t('pickFile')}</p>
            </div>
          ) : (
            /* ─────────────────────────────────────────────────────────
               প্রিভিউ বাঁয়ে, ঘর সরানো ডানে।

               আগে স্লাইডারগুলো প্রিভিউর নিচে ছিল। কার্ডটা লম্বা (বিশেষত
               A4), তাই স্লাইডার পর্যন্ত নামতে গেলে কার্ডটা পর্দার উপরে
               উঠে যেত — কোন ঘর কতটা সরল সেটা আর চোখে দেখা যেত না, অনুমান
               করে নাড়াতে হতো।

               এখন দুইটা পাশাপাশি। ডান পাশটা স্ক্রল করলেও বাঁ পাশের কার্ডটা
               জায়গায় আটকে থাকে (sticky), তাই স্লাইডার নাড়ানোর সাথে সাথেই
               কার্ডে বদলটা দেখা যায়।

               ছোট পর্দায় দুই কলামের জায়গা নেই — তখন আগের মতোই একটার নিচে
               আরেকটা বসে।
               ───────────────────────────────────────────────────────── */
            <div className="mt-5 lg:flex lg:items-start lg:gap-6">
              {/* প্রিভিউতে কেবল ছাপার অংশটুকু লুকানোর নিয়ম — ছাপার CSS এর
                  সেই একই ক্লাসটাই, তাই যা দেখা যায় ছাপাতেও হুবহু তাই। */}
              <style>{'.admit-print-sim .admit-paper-only{display:none !important}'}</style>

              {/* ───────────────────────── বাঁ পাশ — প্রিভিউ */}
              <div className="lg:shrink-0 lg:sticky lg:top-0">

              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[14px] font-bold text-gray-700">
                  {simPrint ? t('previewModePrint') : t('preview')}
                </p>

                {/* ডিজাইন ছাপা না হলে আগে থেকে দেখে নেওয়াটাই আসল কাজ,
                    তাই সুইচটা কেবল তখনই দরকার */}
                {overlay ? (
                  <div className="flex overflow-hidden rounded-[7px] border border-gray-300">
                    {[
                      { on: false, label: t('previewModeDesign') },
                      { on: true, label: t('previewModePrint') },
                    ].map((opt) => (
                      <button
                        key={String(opt.on)}
                        type="button"
                        onClick={() => setSimPrint(opt.on)}
                        className={`px-3 py-1 text-[12px] font-medium transition ${
                          simPrint === opt.on
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* আসল কার্ড কম্পোনেন্টেই আঁকা — এখানে যা দেখা যায়,
                  ছাপাতেও হুবহু তাই আসে */}
              <div
                className={`relative mx-auto overflow-hidden rounded-[4px] border border-gray-300 shadow-sm${
                  overlay && simPrint ? ' admit-print-sim bg-white' : ''
                }`}
                style={{ width: cardW * scale, height: cardH * scale }}
                dir="ltr"
              >
                <div
                  className="absolute top-0 left-0"
                  style={{
                    width: cardW,
                    height: cardH,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  {isRoutine ? (
                    <RoutineCardFace
                      template={template}
                      fields={PREVIEW_FIELDS}
                      student={student}
                      routine={demoRoutine}
                      seat={null}
                      showSeatLine={false}
                      lang={lang}
                      inName={instName}
                      inAddress={instAddress}
                      inLogo={institutionInfo?.Logo}
                      inWatermark={watermarkLogo}
                      showQR
                      showPhoto
                    />
                  ) : (
                    <AdmitCardFace
                      template={template}
                      fields={PREVIEW_FIELDS}
                      student={student}
                      lang={lang}
                      inName={instName}
                      inAddress={instAddress}
                      inLogo={institutionInfo?.Logo}
                      inWatermark={watermarkLogo}
                      showQR
                      showPhoto
                    />
                  )}
                </div>
              </div>

              <p className="mt-2 text-center text-[12px] text-gray-500">
                {overlay && simPrint ? t('previewPrintNote') : t('previewNote')}
              </p>
              </div>

              {/* ───────────────────────── ডান পাশ — ছাপা ও ঘর সরানো */}
              <div className="mt-5 lg:mt-0 lg:flex-1 lg:min-w-0">

              {/* ============================ ছাপা কাগজের উপর ছাপা
                  ঘর সরানোর ঠিক উপরে — কারণ এটা চালু করলে কোন ঘরগুলো
                  আদৌ ছাপা হবে সেটাই বদলে যায়। */}
              <label className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-amber-200 bg-amber-50/60 px-4 py-3">
                <input
                  type="checkbox"
                  checked={overlay}
                  onChange={(e) => {
                    setOverlay(e.target.checked);
                    // বন্ধ করলে সিমুলেশনটা আর অর্থবহ নয়
                    if (!e.target.checked) setSimPrint(false);
                  }}
                  className="mt-[3px] h-4 w-4 shrink-0 cursor-pointer accent-amber-600"
                />
                <span className="min-w-0">
                  <span className="block text-[14px] font-bold text-amber-900">
                    {t('overlayTitle')}
                  </span>
                  <span className="mt-0.5 block text-[13px] font-medium text-amber-900/90">
                    {t('overlayLabel')}
                  </span>
                  <span className="mt-1 block text-[12px] leading-relaxed text-amber-900/70">
                    {t('overlayNote')}
                  </span>
                </span>
              </label>

              {/* ================================= চারটি ঘরের উপর-নিচ
                  প্রিভিউর ঠিক পাশে, কারণ নাড়ালে বাঁ পাশের কার্ডেই সাথে
                  সাথে দেখা যায় — নিচে থাকলে কার্ডটা পর্দার বাইরে চলে যেত। */}
              <div className="mt-4 rounded-[10px] border border-gray-200 bg-gray-50/70 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[14px] font-bold text-gray-800">
                    {t('adjust')}
                  </p>
                  <button
                    type="button"
                    disabled={!hasOffsets(offsets)}
                    onClick={() => setOffsets(ZERO_OFFSETS)}
                    className="rounded-[6px] border border-gray-300 bg-white px-3 py-1 text-[12px] text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ⟲ {t('resetAll')}
                  </button>
                </div>

                <p className="mt-1 text-[12px] leading-relaxed text-gray-500">
                  {t('adjustNote')}
                </p>

                <div className="mt-2 divide-y divide-gray-200">
                  {OFFSET_KEYS.map((key) => (
                    <ZoneRow
                      key={key}
                      t={t}
                      label={getOffsetLabel(key, lang)}
                      value={offsets[key]}
                      onChange={(v) => setOffset(key, v)}
                      onNudge={(step) => nudge(key, step)}
                    />
                  ))}
                </div>
              </div>
              </div>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------- ফুটার */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
          <button
            type="button"
            disabled={busy}
            onClick={() => onClose?.()}
            className="rounded-[8px] border border-gray-300 bg-white px-5 py-2 text-[14px] text-gray-700 hover:bg-gray-100 disabled:opacity-60"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            disabled={(!editing && !file) || busy}
            onClick={handleUpload}
            className="rounded-[8px] bg-blue-600 px-6 py-2 text-[14px] font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editing
              ? busy
                ? t('saving')
                : t('save')
              : busy
              ? t('uploading')
              : t('upload')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdmitTemplateUpload;
