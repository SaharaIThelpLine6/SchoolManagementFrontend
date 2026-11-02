// =============================================================================
// নম্বর পত্র ও স্বাক্ষরপত্র — কাগজের সেটিংস
// =============================================================================

import { Buffer } from 'buffer';

const API_URL = import.meta.env.VITE_SERVER_URL;

/**
 * লোগো → <img src>।
 */
export const toLogoSrc = (value) => {
  if (!value) return '';

  if (typeof value === 'object' && Array.isArray(value?.data)) {
    return `data:image/png;base64,${Buffer.from(value.data).toString('base64')}`;
  }

  if (typeof value !== 'string') return '';

  const path = value.trim();
  if (!path) return '';

  if (/^(https?:|data:|blob:)/i.test(path)) return path;

  const base = String(API_URL || '').replace(/\/+$/, '');

  if (path.startsWith('/')) return `${base}${path}`;
  if (/^public\//i.test(path)) return `${base}/${path}`;

  return `${base}/public/${path}`;
};

/* ───────────────────────────────────────────────────────────────────────────
   কাগজ ও দিক
   ─────────────────────────────────────────────────────────────────────────── */
export const PAPERS = [
  { id: 'a4', label: 'A4', w: 210, h: 297, pad: 10 },
  { id: 'a5', label: 'A5', w: 148, h: 210, pad: 7 },
];

export const paperById = (id) => PAPERS.find((p) => p.id === String(id)) || PAPERS[0];

export const ORIENTATIONS = [
  { id: 'portrait', label: 'Portrait' },
  { id: 'landscape', label: 'Landscape' },
];

export const orientationValue = (v) => (String(v) === 'landscape' ? 'landscape' : 'portrait');

export const paperSize = (settings) => {
  const p = paperById(settings?.paper);
  const landscape = orientationValue(settings?.orientation) === 'landscape';

  return {
    id: p.id,
    label: p.label,
    pad: p.pad,
    width: landscape ? p.h : p.w,
    height: landscape ? p.w : p.h,
    orientation: landscape ? 'landscape' : 'portrait',
  };
};

export const columnCount = (value) => (Number(value) === 2 ? 2 : 1);

/* ───────────────────────────────────────────────────────────────────────────
   ঘরগুলো
   ─────────────────────────────────────────────────────────────────────────── */
export const NUMBER_SHEET_FIELDS = [
  { key: 'SL',              label: 'ক্রম',              width: 8,  align: 'center', defaultOn: true },
  { key: 'AdmissionSerial', label: 'ভর্তি নং',          width: 14, align: 'center', defaultOn: true },
  { key: 'UserCode',        label: 'আইডি নং',           width: 16, align: 'center', defaultOn: true },
  { key: 'UserName',        label: 'পরীক্ষার্থীর নাম',  width: 36, align: 'left',   defaultOn: true },
  { key: 'FatherName',      label: 'পিতার নাম',         width: 30, align: 'left',   defaultOn: false },
  { key: 'MotherName',      label: 'মাতার নাম',         width: 30, align: 'left',   defaultOn: false },
  { key: 'Signature',       label: 'স্বাক্ষর',          width: 24, align: 'center', defaultOn: false, blank: true },
  { key: 'Mark',            label: 'প্রাপ্ত নম্বর',     width: 14, align: 'center', defaultOn: true,  blank: true },
  { key: 'MonthlyMark',     label: 'মাসিক নম্বর',       width: 14, align: 'center', defaultOn: false, blank: true },
  { key: 'TotalMark',       label: 'মোট নম্বর',         width: 14, align: 'center', defaultOn: false, blank: true },
  { key: 'Blank',           label: 'ফাঁকা ঘর',          width: 20, align: 'center', defaultOn: false, blank: true },
];

export const fieldByKey = (key) => NUMBER_SHEET_FIELDS.find((f) => f.key === key) || null;

export const MAX_FIELDS = 8;
export const MAX_FIELDS_TWO_UP = 4;

export const maxFieldsFor = (columns) =>
  columnCount(columns) === 2 ? MAX_FIELDS_TWO_UP : MAX_FIELDS;

export const WIDTH_MIN = 5;
export const WIDTH_MAX = 120;

export const clampWidth = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.min(Math.max(Math.round(n), WIDTH_MIN), WIDTH_MAX);
};

export const WATERMARK_MIN = 2;
export const WATERMARK_MAX = 30;
export const WATERMARK_DEFAULT = 6;

export const clampWatermark = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return WATERMARK_DEFAULT;
  return Math.min(Math.max(Math.round(n), WATERMARK_MIN), WATERMARK_MAX);
};

export const BLANK_ROWS_MAX = 20;

export const clampBlankRows = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.round(n), BLANK_ROWS_MAX);
};

export const SORT_KEYS = [
  { key: 'AdmissionSerial', label: 'ভর্তি নং' },
  { key: 'UserCode',        label: 'আইডি নং' },
];

export const sortKeyValue = (v) => (String(v) === 'UserCode' ? 'UserCode' : 'AdmissionSerial');
export const sortOrderValue = (v) => (String(v) === 'desc' ? 'desc' : 'asc');

export const FONT_MIN = 6;
export const FONT_MAX = 13;
export const FONT_DEFAULT = 9;

export const clampFont = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return FONT_DEFAULT;
  return Math.min(Math.max(Math.round(n * 10) / 10, FONT_MIN), FONT_MAX);
};

export const ROW_HEIGHT_MAX = 15;

export const clampRowHeight = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(Math.round(n * 10) / 10, ROW_HEIGHT_MAX);
};

export const rowHeightMm = (settings) => {
  const set = clampRowHeight(settings?.rowHeight);
  if (set > 0) return set;

  const font = clampFont(settings?.fontSize);
  return Math.round((font * 1.25 * 0.3528 + 1.4) * 100) / 100;
};

export const langCode = (languageId) => (Number(languageId) === 2 ? 'ar' : 'bn');

/** ডিফল্ট সেটিংস */
export const defaultNumberSheetSettings = () => ({
  visible: NUMBER_SHEET_FIELDS.filter((f) => f.defaultOn).map((f) => f.key),
  labels: {},
  widths: {},
  paper: 'a4',
  orientation: 'portrait',
  columns: 2,
  sortBy: 'AdmissionSerial',
  sortOrder: 'asc',
  fontSize: FONT_DEFAULT,

  showHeader: true,
  showLogo: true,
  showExamBand: true,
  showMeta: true,
  showExaminer: true,
  showFooterSign: true,

  // ⭐ নতুন যোগ করা হলো - জমার তারিখ (হাতে লেখার জন্য)
  showSubmissionDate: false,
  submissionDateText: 'জমার তারিখ',

  showWatermark: false,
  watermarkOpacity: WATERMARK_DEFAULT,

  signLeft: '',
  signRight: '',

  blankRows: 0,
  rowHeight: 0,
  title: '',
});

export const TITLE_DEFAULT = 'নম্বর পত্র';

export const titleText = (settings) => {
  const v = settings?.title;
  return typeof v === 'string' && v.trim() ? v.trim() : TITLE_DEFAULT;
};

export const SIGN_DEFAULTS = {
  signLeft: 'প্রধান পরীক্ষকের স্বাক্ষর',
  signRight: 'হল পরিদর্শকের স্বাক্ষর',
};

export const signText = (settings, key) => {
  const v = settings?.[key];
  return typeof v === 'string' && v.trim() ? v.trim() : SIGN_DEFAULTS[key] || '';
};

const storageKey = (languageId) => `examNumberSheet:settings:${langCode(languageId)}`;

export const normalizeNumberSheetSettings = (saved) => {
  const fallback = defaultNumberSheetSettings();
  if (!saved || typeof saved !== 'object') return fallback;

  const visible = (Array.isArray(saved.visible) ? saved.visible : []).filter((k) => fieldByKey(k));

  return {
    ...fallback,
    ...saved,
    visible: visible.length ? visible : fallback.visible,
    labels: saved.labels && typeof saved.labels === 'object' ? saved.labels : {},
    widths: saved.widths && typeof saved.widths === 'object' ? saved.widths : {},
    paper: paperById(saved.paper).id,
    orientation: orientationValue(saved.orientation),
    columns: columnCount(saved.columns),
    sortBy: sortKeyValue(saved.sortBy),
    sortOrder: sortOrderValue(saved.sortOrder),
    fontSize: clampFont(saved.fontSize),
    showHeader: saved.showHeader !== false,
    showLogo: saved.showLogo !== false,
    showExamBand: saved.showExamBand !== false,
    showMeta: saved.showMeta !== false,
    showExaminer: saved.showExaminer !== false,
    showFooterSign: saved.showFooterSign !== false,

    // ⭐ নতুন যোগ করা হলো
    showSubmissionDate: saved.showSubmissionDate === true,
    submissionDateText: typeof saved.submissionDateText === 'string' ? saved.submissionDateText : 'জমার তারিখ',

    showWatermark: saved.showWatermark === true,
    watermarkOpacity: clampWatermark(saved.watermarkOpacity),
    signLeft: typeof saved.signLeft === 'string' ? saved.signLeft : '',
    signRight: typeof saved.signRight === 'string' ? saved.signRight : '',
    blankRows: clampBlankRows(saved.blankRows),
    rowHeight: clampRowHeight(saved.rowHeight),
    title: typeof saved.title === 'string' ? saved.title : '',
  };
};

export const loadNumberSheetSettings = (languageId = 1) => {
  try {
    const raw = localStorage.getItem(storageKey(languageId));
    if (!raw) return defaultNumberSheetSettings();
    return normalizeNumberSheetSettings(JSON.parse(raw));
  } catch {
    return defaultNumberSheetSettings();
  }
};

export const saveNumberSheetSettings = (languageId, settings) => {
  try {
    localStorage.setItem(storageKey(languageId), JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
};

export const isVisible = (settings, key) =>
  Array.isArray(settings?.visible) && settings.visible.includes(key);

export const visibleFields = (settings) => {
  const order = Array.isArray(settings?.visible) ? settings.visible : [];
  const list = order.map(fieldByKey).filter(Boolean);
  const picked = list.length ? list : NUMBER_SHEET_FIELDS.filter((f) => f.defaultOn);
  return picked.slice(0, maxFieldsFor(settings?.columns));
};

export const resolveFields = (settings) =>
  visibleFields(settings).map((f) => {
    const label = settings?.labels?.[f.key];
    const width = clampWidth(settings?.widths?.[f.key]);
    return {
      ...f,
      label: typeof label === 'string' && label.trim() ? label.trim() : f.label,
      width: width ?? f.width,
    };
  });

export const fieldPercents = (fields) => {
  const total = fields.reduce((sum, f) => sum + (f.width || 10), 0) || 1;
  return fields.map((f) => `${((f.width || 10) / total) * 100}%`);
};

export const toggleField = (visible, key, limit = MAX_FIELDS) => {
  const list = Array.isArray(visible) ? visible : [];
  if (list.includes(key)) return list.filter((k) => k !== key);
  if (list.length >= limit) return list;
  const order = NUMBER_SHEET_FIELDS.map((f) => f.key);
  return [...list, key].sort((a, b) => order.indexOf(a) - order.indexOf(b));
};

export const renameField = (settings, key, text) => {
  const labels = { ...(settings?.labels || {}) };
  if (String(text ?? '').trim()) labels[key] = text;
  else delete labels[key];
  return { ...settings, labels };
};

export const setFieldWidth = (settings, key, value) => {
  const widths = { ...(settings?.widths || {}) };
  const w = clampWidth(value);
  if (w === null) delete widths[key];
  else widths[key] = w;
  return { ...settings, widths };
};

export const reorderFields = (visible, fromKey, toKey) => {
  const list = [...(visible || [])];
  const from = list.indexOf(fromKey);
  const to = list.indexOf(toKey);
  if (from < 0 || to < 0 || from === to) return list;
  list.splice(from, 1);
  list.splice(to, 0, fromKey);
  return list;
};

export const sortRows = (rows, sortBy, sortOrder) => {
  const key = sortKeyValue(sortBy);
  const dir = sortOrderValue(sortOrder) === 'desc' ? -1 : 1;

  const pick = (row) => {
    const direct = row?.[key];
    const nested = row?.User?.[key];
    return direct ?? nested ?? null;
  };

  const toNum = (v) => {
    const s = String(v ?? '').trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  return [...(Array.isArray(rows) ? rows : [])].sort((a, b) => {
    const na = toNum(pick(a));
    const nb = toNum(pick(b));
    if (na === null && nb === null) return 0;
    if (na === null) return 1;
    if (nb === null) return -1;
    if (na !== nb) return (na - nb) * dir;
    return 0;
  });
};

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const toBn = (value) => {
  if (value === null || value === undefined || value === '') return '';
  return String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
};

export const hasValue = (v) => v !== null && v !== undefined && String(v).trim() !== '';

export const cellValue = (field, row) => {
  if (!field || field.blank) return '';
  const v = row?.[field.key] ?? row?.User?.[field.key];
  return hasValue(v) ? v : '';
};
